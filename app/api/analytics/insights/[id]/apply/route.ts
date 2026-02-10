import { NextResponse } from "next/server"
import { jsonError, parsePeriod, requireAnalyticsSession } from "../../../_lib"

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

  const response: ApplyInsightResponse = {
    ok: true,
    data: {
      insightId,
      period: periodResult.period,
      applied: true,
      appliedAt: new Date().toISOString(),
    },
  }

  return NextResponse.json(response)
}
