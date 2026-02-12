import { NextResponse } from "next/server"
import { getCanonicalStreamUrl, readData } from "../../utils"
import type { DashboardStreamDetailsResponse } from "@/lib/types/dashboard-streams"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await readData()

  const recentStream = data.recent.find((stream) => stream.id === params.id)
  if (recentStream) {
    const payload: DashboardStreamDetailsResponse = {
      stream: {
        id: recentStream.id,
        title: recentStream.title,
        category: recentStream.category,
        status: recentStream.status ?? "ended",
        url: recentStream.url || getCanonicalStreamUrl(recentStream.id),
        startedAt: recentStream.date,
        viewers: recentStream.viewers,
        duration: recentStream.duration,
      },
    }

    return NextResponse.json(payload)
  }

  const scheduledStream = data.scheduled.find((stream) => stream.id === params.id)
  if (scheduledStream) {
    const startsAt = scheduledStream.startsAt ?? (scheduledStream as { dateTime?: string }).dateTime

    const payload: DashboardStreamDetailsResponse = {
      stream: {
        id: scheduledStream.id,
        title: scheduledStream.title,
        category: scheduledStream.category,
        status: scheduledStream.status ?? "scheduled",
        url: scheduledStream.url || getCanonicalStreamUrl(scheduledStream.id),
        startsAt,
      },
    }

    return NextResponse.json(payload)
  }

  return NextResponse.json({ error: "Stream not found" }, { status: 404 })
}
