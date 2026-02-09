import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { readData, writeData } from "../utils"
import type { DashboardScheduledStream, ScheduleStreamRequest, ScheduleStreamResponse } from "@/lib/types/dashboard-streams"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ScheduleStreamRequest | null

  if (!body?.title?.trim() || !body?.startsAt) {
    return NextResponse.json({ error: "Missing title or startsAt" }, { status: 400 })
  }

  const startsAtDate = new Date(body.startsAt)
  if (Number.isNaN(startsAtDate.getTime())) {
    return NextResponse.json({ error: "Invalid startsAt" }, { status: 400 })
  }

  const data = await readData()
  const scheduled: DashboardScheduledStream = {
    id: uuidv4(),
    title: body.title.trim(),
    category: body.category,
    startsAt: startsAtDate.toISOString(),
    status: "scheduled",
  }

  data.scheduled = [scheduled, ...data.scheduled]
  await writeData(data)

  const payload: ScheduleStreamResponse = scheduled
  return NextResponse.json(payload, { status: 201 })
}
