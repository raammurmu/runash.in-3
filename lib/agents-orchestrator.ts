import { AgentsRepository } from "@/lib/agents-repository"
import { detectPromptInjection } from "@/lib/agents-safety"

const TOOL_CACHE = new Map<string, { value: Record<string, unknown>; expiresAt: number }>()

type StreamEvent =
  | { type: "status"; value: string }
  | { type: "token"; value: string }
  | { type: "tool_start"; tool: string }
  | { type: "tool_result"; tool: string; result: Record<string, unknown> }
  | { type: "final"; output: string; sessionId: string }
  | { type: "error"; message: string }

async function invokeTool(toolName: string, args: Record<string, unknown>, timeoutMs = 1500) {
  const cacheKey = `${toolName}:${JSON.stringify(args)}`
  const now = Date.now()
  const cached = TOOL_CACHE.get(cacheKey)
  if (cached && cached.expiresAt > now) return cached.value

  const result = await Promise.race([
    new Promise<Record<string, unknown>>((resolve) => {
      setTimeout(() => resolve({ ok: true, toolName, received: args, at: new Date().toISOString() }), 120)
    }),
    new Promise<Record<string, unknown>>((_, reject) => {
      setTimeout(() => reject(new Error(`Tool timeout for ${toolName}`)), timeoutMs)
    }),
  ])

  TOOL_CACHE.set(cacheKey, { value: result, expiresAt: now + 30_000 })
  return result
}

export class AgentsOrchestrator {
  static async *runChat(input: {
    sessionId?: string
    userId: string
    message: string
    toolPermissions: string[]
  }): AsyncGenerator<StreamEvent> {
    const session = await AgentsRepository.createOrGetSession(input.userId, input.sessionId)
    await AgentsRepository.saveMessage({
      sessionId: session.id,
      userId: input.userId,
      role: "user",
      content: input.message,
    })

    const injection = detectPromptInjection(input.message)
    if (injection.flagged) {
      await AgentsRepository.updateSessionStatus(session.id, "failed")
      yield { type: "status", value: "failed" }
      yield { type: "error", message: "Input blocked by safety guardrails." }
      return
    }

    yield { type: "status", value: "queued" }
    yield { type: "status", value: "streaming" }

    const draft = `Processing request: ${input.message}`
    for (const token of draft.split(" ")) {
      yield { type: "token", value: `${token} ` }
    }

    if (input.toolPermissions.includes("catalog:read")) {
      yield { type: "status", value: "tool-running" }
      yield { type: "tool_start", tool: "catalog_lookup" }

      let toolResult: Record<string, unknown> = {}
      let attempts = 0
      while (attempts < 2) {
        attempts += 1
        try {
          toolResult = await invokeTool("catalog_lookup", { query: input.message })
          break
        } catch {
          if (attempts >= 2) throw new Error("Tool failed after retry")
        }
      }

      await AgentsRepository.saveToolCall({
        sessionId: session.id,
        userId: input.userId,
        toolName: "catalog_lookup",
        args: { query: input.message },
        result: toolResult,
        status: "completed",
        latencyMs: 120,
      })
      yield { type: "tool_result", tool: "catalog_lookup", result: toolResult }
    }

    const finalOutput = "Done. I prepared a safe response with tool context when available."
    await AgentsRepository.saveMessage({
      sessionId: session.id,
      userId: input.userId,
      role: "assistant",
      content: finalOutput,
      rawOutput: JSON.stringify({ model: "mock-v1", finalOutput }),
      renderedOutput: finalOutput,
    })
    await AgentsRepository.updateSessionStatus(session.id, "completed", finalOutput, JSON.stringify({ source: "model" }))

    yield { type: "status", value: "completed" }
    yield { type: "final", output: finalOutput, sessionId: session.id }
  }
}
