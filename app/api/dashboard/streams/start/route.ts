import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getCanonicalStreamUrl, readData, writeData } from "../utils"
import type { DashboardRecentStream, StartStreamRequest, StartStreamResponse } from "@/lib/types/dashboard-streams"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as StartStreamRequest | null

  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 })
  }

  const data = await readData()
  const id = uuidv4()
  const startedAt = new Date().toISOString()
  const url = getCanonicalStreamUrl(id)

  const newStream: DashboardRecentStream = {
    id,
    title: body.title.trim(),
    category: body.category,
    date: startedAt,
    viewers: 0,
    duration: null,
    url,
    status: "live",
  }

  data.recent = [newStream, ...data.recent].slice(0, 20)
  await writeData(data)

  const payload: StartStreamResponse = {
    id,
    title: newStream.title,
    category: newStream.category,
    url,
    status: "live",
    startedAt,
  }

  return NextResponse.json(payload, { status: 201 })
}
