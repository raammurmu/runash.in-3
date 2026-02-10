import { NextResponse } from "next/server"
import { parseOptionalStreamId, parsePeriod, requireAnalyticsSession, seedFromContext, seededValue } from "../../_lib"

type LiveLatestResponse = {
  timestamp: string
  viewers: number
  chatActivity: number
  device: string
  latency: number
  quality: string
  streamFrom: string
  deliverFrom: string
  player: string
}

const DEVICES = ["desktop", "mobile", "tablet"] as const
const QUALITIES = ["1080p", "720p", "480p"] as const
const STREAM_REGIONS = ["us-east-1", "eu-west-1", "ap-southeast-1"] as const
const EDGE_REGIONS = ["cdn-edge-3", "cdn-edge-5", "cdn-edge-7"] as const
const PLAYERS = ["hlsjs", "dashjs"] as const

export async function GET(request: Request) {
  const auth = await requireAnalyticsSession()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)

  const periodResult = parsePeriod(searchParams)
  if (!periodResult.ok) return periodResult.response

  const streamIdResult = parseOptionalStreamId(searchParams)
  if (!streamIdResult.ok) return streamIdResult.response

  const seed = seedFromContext(auth.userId, periodResult.period, streamIdResult.streamId)

  const response: LiveLatestResponse = {
    timestamp: new Date().toISOString(),
    viewers: seededValue(seed, 220, 2800),
    chatActivity: seededValue(seed >>> 1, 10, 420),
    device: DEVICES[seed % DEVICES.length],
    latency: seededValue(seed >>> 2, 80, 240),
    quality: QUALITIES[seed % QUALITIES.length],
    streamFrom: STREAM_REGIONS[seed % STREAM_REGIONS.length],
    deliverFrom: EDGE_REGIONS[seed % EDGE_REGIONS.length],
    player: PLAYERS[seed % PLAYERS.length],
  }

  return NextResponse.json(response)
}
