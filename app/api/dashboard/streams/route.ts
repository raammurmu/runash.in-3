import { type NextRequest, NextResponse } from "next/server"
import { readData } from "./utils"
import type { DashboardRecentStreamsResponse } from "@/lib/types/dashboard-streams"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "6", 10)

  const data = await readData()
  const payload: DashboardRecentStreamsResponse = {
    streams: data.recent.slice(0, Number.isNaN(limit) ? 6 : limit),
  }

  return NextResponse.json(payload)
}
