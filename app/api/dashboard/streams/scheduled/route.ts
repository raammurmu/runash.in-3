import { NextResponse } from "next/server"
import { getCanonicalStreamUrl, readData } from "../utils"
import type { DashboardScheduledStream, DashboardScheduledStreamsResponse } from "@/lib/types/dashboard-streams"

export async function GET() {
  const data = await readData()
  const payload: DashboardScheduledStreamsResponse = {
    streams: data.scheduled.map((stream) => ({
      ...stream,
      startsAt: stream.startsAt ?? (stream as DashboardScheduledStream & { dateTime?: string }).dateTime ?? new Date().toISOString(),
      url: stream.url || getCanonicalStreamUrl(stream.id),
      status: stream.status ?? "scheduled",
    })),
  }
  return NextResponse.json(payload)
}
