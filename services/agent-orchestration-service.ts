import { createHash } from "crypto"

import {
  completeToolCallLineage,
  createToolCallLineage,
  createToolResult,
  pruneExpiredAgentRecords,
} from "@/lib/repositories/agent-orchestration"
import { searchProductsWithProviders } from "@/services/web-search-service"

export type SupportedTool = "catalog_lookup" | "inventory_health" | "checkout_preview" | "web_search"

export type ToolExecutionContext = {
  sessionId: string
  messageId: string
  tenantId: string
}

export type ToolExecutionResult = {
  tool: SupportedTool
  result: Record<string, unknown>
  fromCache: boolean
}

const TOOL_TIMEOUT_MS = Number(process.env.RUNASH_AGENT_TOOL_TIMEOUT_MS ?? "7000")
const TOOL_RETRY_COUNT = Number(process.env.RUNASH_AGENT_TOOL_RETRY_COUNT ?? "2")
const catalogCache = new Map<string, { expiresAt: number; value: Record<string, unknown> }>()
const userThrottles = new Map<string, { count: number; windowStart: number }>()

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getToolCacheKey(tool: SupportedTool, payload: Record<string, unknown>) {
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex")
  return `${tool}:${digest}`
}

async function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`tool_timeout_${timeoutMs}ms`)), timeoutMs)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

async function executeCatalogLookup(payload: Record<string, unknown>) {
  const query = String(payload.query ?? "").trim().toLowerCase()
  await wait(120)

  return {
    query,
    items: [
      { sku: "ORG-QUINOA-1", name: "Organic Quinoa", score: 0.96 },
      { sku: "ORG-AVO-2", name: "Organic Avocado", score: 0.91 },
    ],
  }
}

async function executeInventoryHealth(payload: Record<string, unknown>) {
  await wait(100)
  return {
    warehouse: String(payload.warehouse ?? "default"),
    lowStockSkus: ["ORG-QUINOA-1", "BAG-REUSE-5"],
    generatedAt: new Date().toISOString(),
  }
}

async function executeCheckoutPreview(payload: Record<string, unknown>) {
  await wait(110)
  const lineItems = Array.isArray(payload.items) ? payload.items.length : 0
  return {
    lineItems,
    estimatedTotal: 42.5,
    warnings: lineItems > 8 ? ["Large cart may require split shipment"] : [],
  }
}


async function executeWebSearch(payload: Record<string, unknown>) {
  const query = String(payload.query ?? "").trim()
  const results = await searchProductsWithProviders(query)
  return {
    query,
    results,
    provider: results[0]?.source ?? "fallback",
    generatedAt: new Date().toISOString(),
  }
}

function isHighRiskAction(actionType: string, actionPayload: Record<string, unknown>) {
  const combined = `${actionType}:${JSON.stringify(actionPayload)}`.toLowerCase()
  return /(payment|refund|charge|subscription|account|delete|payout|transfer)/.test(combined)
}

function hasPromptInjection(content: string) {
  return /(ignore previous|reveal system prompt|bypass|disable safety|print secrets|exfiltrate)/i.test(content)
}

function sanitizeUserInput(input: string) {
  return input.replace(/\b(?:\d[ -]*?){13,19}\b/g, "[REDACTED_CARD]").slice(0, 5000)
}

export function enforceAdaptiveThrottle(identity: string, ceiling = 40, windowMs = 60_000) {
  const now = Date.now()
  const current = userThrottles.get(identity)

  if (!current || now - current.windowStart > windowMs) {
    userThrottles.set(identity, { count: 1, windowStart: now })
    return { allowed: true, remaining: ceiling - 1 }
  }

  current.count += 1

  if (current.count > ceiling) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: Math.max(ceiling - current.count, 0) }
}

export async function executeToolWithPolicy(
  tool: SupportedTool,
  payload: Record<string, unknown>,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  const cacheKey = getToolCacheKey(tool, payload)
  const now = Date.now()

  if (tool === "catalog_lookup") {
    const cached = catalogCache.get(cacheKey)
    if (cached && cached.expiresAt > now) {
      return { tool, result: cached.value, fromCache: true }
    }
  }

  const lineage = await createToolCallLineage({
    session_id: context.sessionId,
    message_id: context.messageId,
    tool_name: tool,
    input: payload,
    status: "started",
  })

  const execMap: Record<SupportedTool, () => Promise<Record<string, unknown>>> = {
    catalog_lookup: () => executeCatalogLookup(payload),
    inventory_health: () => executeInventoryHealth(payload),
    checkout_preview: () => executeCheckoutPreview(payload),
    web_search: () => executeWebSearch(payload),
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= TOOL_RETRY_COUNT; attempt += 1) {
    try {
      const result = await runWithTimeout(execMap[tool](), TOOL_TIMEOUT_MS)
      await createToolResult(lineage.id, result)
      await completeToolCallLineage(lineage.id, "completed")

      if (tool === "catalog_lookup") {
        catalogCache.set(cacheKey, { value: result, expiresAt: Date.now() + 30_000 })
      }

      return { tool, result, fromCache: false }
    } catch (error) {
      lastError = error
      if (attempt < TOOL_RETRY_COUNT) {
        await wait(120 * (attempt + 1))
      }
    }
  }

  await completeToolCallLineage(lineage.id, "failed")
  throw lastError instanceof Error ? lastError : new Error("tool_execution_failed")
}

export const AgentOrchestrationService = {
  sanitizeUserInput,
  hasPromptInjection,
  isHighRiskAction,
  executeToolWithPolicy,
  enforceAdaptiveThrottle,
  runRetentionSweep: pruneExpiredAgentRecords,
}
