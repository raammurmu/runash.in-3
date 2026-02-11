import { getServerSession } from "next-auth"
import { NextResponse, type NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"
import { RBACManager } from "@/lib/rbac"
import { rateLimit } from "@/lib/rate-limit"
import { AuditLogger } from "@/lib/audit-logger"

export async function getAuthedUser(request: NextRequest, requiredScopes: string[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const userId = Number.parseInt(session.user.id, 10)
  if (!Number.isFinite(userId)) {
    return { error: NextResponse.json({ error: "Invalid user" }, { status: 401 }) }
  }

  if (requiredScopes.length > 0) {
    const hasScope = await RBACManager.hasAnyPermission(userId, requiredScopes)
    if (!hasScope) {
      await AuditLogger.log({
        userId,
        action: "agents_scope_denied",
        resource: "agents",
        success: false,
        details: { requiredScopes },
      })
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
    }
  }

  const limitResult = await rateLimit(request, `agents:${userId}`, 60, 60)
  if (!limitResult.success) {
    return {
      error: NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAt: limitResult.resetTime,
        },
        { status: 429 },
      ),
    }
  }

  return { userId: String(userId) }
}

export async function logAgentAudit(entry: {
  userId: number
  action: string
  resource: string
  details?: Record<string, unknown>
  success: boolean
  errorMessage?: string
}) {
  await AuditLogger.log({
    userId: entry.userId,
    action: entry.action,
    resource: entry.resource,
    details: entry.details,
    success: entry.success,
    errorMessage: entry.errorMessage,
  })
}
