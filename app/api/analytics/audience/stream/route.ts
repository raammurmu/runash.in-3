import { parsePeriod, requireAnalyticsSession, seedFromContext } from "../../_lib"
import { audienceQuerySeedSuffix, buildAudiencePayload, parseAudienceQuery } from "../shared"

export async function GET(request: Request) {
  const auth = await requireAnalyticsSession()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)

  const periodResult = parsePeriod(searchParams)
  if (!periodResult.ok) return periodResult.response

  const queryResult = parseAudienceQuery(searchParams)
  if (!queryResult.ok) return queryResult.response

  const seed = seedFromContext(auth.userId, periodResult.period, audienceQuerySeedSuffix(queryResult.value))
  const payload = buildAudiencePayload(seed)

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: ${JSON.stringify({ ok: true })}\n\n`))
      }, 15000)

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
