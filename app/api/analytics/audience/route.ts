import { NextResponse } from "next/server"
import { parsePeriod, requireAnalyticsSession, seedFromContext } from "../_lib"
import { audienceQuerySeedSuffix, buildAudiencePayload, parseAudienceQuery } from "./shared"

export async function GET(request: Request) {
  const auth = await requireAnalyticsSession()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)

  const periodResult = parsePeriod(searchParams)
  if (!periodResult.ok) return periodResult.response

  const queryResult = parseAudienceQuery(searchParams)
  if (!queryResult.ok) return queryResult.response

  const seed = seedFromContext(auth.userId, periodResult.period, audienceQuerySeedSuffix(queryResult.value))

  return NextResponse.json(buildAudiencePayload(seed))
}
