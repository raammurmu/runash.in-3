import { AsyncLocalStorage } from "node:async_hooks"
import crypto from "node:crypto"

export type LogLevel = "debug" | "info" | "warn" | "error"

interface RequestContext {
  correlationId: string
  requestId: string
  route?: string
  userId?: string
}

const requestContextStore = new AsyncLocalStorage<RequestContext>()

const SENSITIVE_KEY_PATTERN = /pass(word)?|token|secret|authorization|cookie|api[-_]?key|card|cvv|email|phone|ssn|otp|address|auth/i

function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === "string") {
    if (value.length <= 4) return "[REDACTED]"
    return `${value.slice(0, 2)}***${value.slice(-2)}`
  }
  return "[REDACTED]"
}

export function redactSensitiveData(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map((value) => redactSensitiveData(value))
  }

  if (input && typeof input === "object") {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        sanitized[key] = redactValue(value)
      } else {
        sanitized[key] = redactSensitiveData(value)
      }
    }

    return sanitized
  }

  return input
}

export function generateCorrelationId(): string {
  return crypto.randomUUID()
}

export function getRequestContext(): RequestContext | undefined {
  return requestContextStore.getStore()
}

export function getCorrelationId(): string | undefined {
  return getRequestContext()?.correlationId
}

export async function withRequestContext<T>(context: RequestContext, callback: () => Promise<T>): Promise<T> {
  return requestContextStore.run(context, callback)
}

export function logEvent(level: LogLevel, message: string, metadata: Record<string, unknown> = {}): void {
  const context = getRequestContext()
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: context?.correlationId,
    requestId: context?.requestId,
    route: context?.route,
    userId: context?.userId,
    metadata: redactSensitiveData(metadata),
  }

  const serialized = JSON.stringify(payload)

  if (level === "error") {
    console.error(serialized)
    return
  }

  if (level === "warn") {
    console.warn(serialized)
    return
  }

  console.log(serialized)
}

export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
  }
}
