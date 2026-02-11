import { NextResponse, type NextRequest } from "next/server"
import { getSql } from "@/lib/db/neon"
import { logEvent, serializeError } from "@/lib/observability"

export async function handleApiError(error: unknown, statusCode = 500) {
  logEvent("error", "[API Error]", { error: serializeError(error), statusCode })

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: statusCode })
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const userId = request.headers.get("x-user-id")
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return await handler(request, userId)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export async function withRateLimit(request: NextRequest, limit = 100, windowMs = 60000) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const key = `ratelimit:${ip}`
  const sql = getSql()

  try {
    const result = await sql(
      `INSERT INTO rate_limit_store (key, count, reset_time, created_at, updated_at)
       VALUES ($1, 1, NOW() + INTERVAL '1 second' * $2, NOW(), NOW())
       ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN reset_time > NOW() THEN count + 1 ELSE 1 END,
       reset_time = CASE WHEN reset_time > NOW() THEN reset_time ELSE NOW() + INTERVAL '1 second' * $2 END,
       updated_at = NOW()
       RETURNING count, reset_time`,
      [key, Math.floor(windowMs / 1000)],
    )

    const { count, reset_time } = result[0]
    if (count > limit) {
      return {
        allowed: false,
        retryAfter: Math.ceil((new Date(reset_time).getTime() - Date.now()) / 1000),
      }
    }

    return { allowed: true }
  } catch (error) {
    logEvent("warn", "Rate limit check failed; failing open", { error: serializeError(error) })
    return { allowed: true }
  }
}

export async function logAudit(userId: string, action: string, resource: string, details?: any) {
  try {
    const sql = getSql()
    await sql(
      `INSERT INTO audit_logs (user_id, action, resource, details, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, action, resource, details ? JSON.stringify(details) : null],
    )
  } catch (error) {
    logEvent("error", "Audit log failed", { error: serializeError(error), action, resource, userId })
  }
}
