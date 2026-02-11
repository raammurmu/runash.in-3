import { NextResponse } from "next/server"
import { jsonError, parsePeriod, requireAnalyticsSession } from "../../../_lib"
import { executeIdempotentMutation, getIdempotencyKeyFromHeaders } from "@/lib/idempotency"

type ApplyInsightResponse = {
  ok: true
  data: {
    insightId: string
    period: string
    applied: boolean
    appliedAt: string
  }
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const auth = await requireAnalyticsSession()
  if ("error" in auth) return auth.error

  const idempotencyKey = getIdempotencyKeyFromHeaders(request.headers)
  if (!idempotencyKey) {
    return jsonError(400, "MISSING_IDEMPOTENCY_KEY", "Missing required header: idempotency-key.")
  }

  const insightId = context.params.id?.trim()

  if (!insightId || !/^[a-zA-Z0-9_-]{1,100}$/.test(insightId)) {
    return jsonError(400, "INVALID_PATH", "Invalid insight id in route path.", {
      id: "Use 1-100 characters: letters, numbers, '-' or '_'.",
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, "INVALID_BODY", "Request body must be valid JSON.")
  }

  const periodInput = typeof body === "object" && body !== null ? (body as { period?: string }).period : undefined
  const periodSearchParams = new URLSearchParams({ period: periodInput ?? "7d" })
  const periodResult = parsePeriod(periodSearchParams)
  if (!periodResult.ok) return periodResult.response

  try {
    const result = await executeIdempotentMutation({
      idempotencyKey,
      scope: `agent-action:insight-apply:${auth.session.user.id}`,
      requestHash: JSON.stringify({ insightId, period: periodResult.period }),
      execute: async () => {
        const response: ApplyInsightResponse = {
          ok: true,
          data: {
            insightId,
            period: periodResult.period,
            applied: true,
            appliedAt: new Date().toISOString(),
          },
        }

        return {
          statusCode: 200,
          response,
        }
      },
    })

    return NextResponse.json(result.response, { status: result.statusCode })
  } catch (error) {
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD") {
      return jsonError(409, "IDEMPOTENCY_CONFLICT", "Idempotency key reuse detected with a different payload.")
    }

    return jsonError(500, "INSIGHT_APPLY_ERROR", "Failed to apply insight action.")
  }
}
