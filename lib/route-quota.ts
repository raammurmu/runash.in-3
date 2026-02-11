import type { NextRequest } from "next/server"

interface QuotaEntry {
  count: number
  resetAt: number
}

const quotaStore = new Map<string, QuotaEntry>()

export interface QuotaResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

function resolveIp(request: NextRequest): string {
  return request.ip || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}

function buildKey(scope: string, identifier: string): string {
  return `${scope}:${identifier}`
}

function checkAndConsume(key: string, limit: number, windowMs: number): QuotaResult {
  const now = Date.now()
  const current = quotaStore.get(key)

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs
    quotaStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt }
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  quotaStore.set(key, current)

  return { allowed: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt }
}

export function enforceDualQuota(
  request: NextRequest,
  route: string,
  config: {
    perIpLimit: number
    perUserLimit: number
    windowMs: number
    userId?: string | null
  },
): QuotaResult {
  const ip = resolveIp(request)
  const ipResult = checkAndConsume(buildKey(`${route}:ip`, ip), config.perIpLimit, config.windowMs)

  if (!ipResult.allowed) {
    return ipResult
  }

  if (!config.userId) {
    return ipResult
  }

  return checkAndConsume(buildKey(`${route}:user`, config.userId), config.perUserLimit, config.windowMs)
}
