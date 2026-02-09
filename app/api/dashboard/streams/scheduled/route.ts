import { NextResponse } from "next/server"
import { readData } from "../utils"
import type { DashboardScheduledStreamsResponse } from "@/lib/types/dashboard-streams"

export async function GET() {
  const data = await readData()
  const payload: DashboardScheduledStreamsResponse = { streams: data.scheduled }
  return NextResponse.json(payload)
}
