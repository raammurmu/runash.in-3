import { type NextRequest, NextResponse } from "next/server"
import { listScheduledDashboardStreams } from "@/lib/repositories/dashboard-streams"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)

    const streams = await listScheduledDashboardStreams(Number.parseInt(userId, 10), limit)
    return NextResponse.json(streams)
  } catch (error) {
    console.error("Error fetching scheduled dashboard streams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
