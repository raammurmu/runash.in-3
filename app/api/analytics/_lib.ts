import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

const PERIOD_VALUES = ["24h", "7d", "30d", "90d", "1y"] as const

export type AnalyticsPeriod = (typeof PERIOD_VALUES)[number]

type ErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_QUERY"
  | "INVALID_PATH"
  | "INVALID_BODY"
  | "INTERNAL_ERROR"

export function jsonError(status: number, code: ErrorCode, message: string, details?: Record<string, string>) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details: details ?? {},
      },
    },
    { status },
  )
}

export async function requireAnalyticsSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: jsonError(401, "UNAUTHORIZED", "Authentication required for analytics endpoints.") }
  }

  return { userId: String(session.user.id) }
}

export function parsePeriod(searchParams: URLSearchParams):
  | { ok: true; period: AnalyticsPeriod }
  | { ok: false; response: NextResponse } {
  const raw = (searchParams.get("period") ?? "7d").trim()

  if (!PERIOD_VALUES.includes(raw as AnalyticsPeriod)) {
    return {
      ok: false,
      response: jsonError(400, "INVALID_QUERY", "Invalid 'period' query parameter.", {
        period: `Expected one of: ${PERIOD_VALUES.join(", ")}`,
      }),
    }
  }

  return { ok: true, period: raw as AnalyticsPeriod }
}

export function parseOptionalStreamId(searchParams: URLSearchParams):
  | { ok: true; streamId?: string }
  | { ok: false; response: NextResponse } {
  const streamId = searchParams.get("streamId")?.trim()

  if (!streamId) {
    return { ok: true, streamId: undefined }
  }

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(streamId)) {
    return {
      ok: false,
      response: jsonError(400, "INVALID_QUERY", "Invalid 'streamId' query parameter.", {
        streamId: "Use 1-64 characters: letters, numbers, '-' or '_'.",
      }),
    }
  }

  return { ok: true, streamId }
}

export function buildSeed(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

export function seededValue(seed: number, min: number, max: number, step = 1): number {
  const range = Math.max(0, max - min)
  if (range === 0) return min

  const raw = min + (seed % (range + 1))
  return Math.round(raw / step) * step
}

export function seedFromContext(userId: string, period: AnalyticsPeriod, streamId?: string) {
  return buildSeed(`${userId}:${period}:${streamId ?? "all"}`)
}
