import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { DashboardService } from "@/lib/dashboard-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = Number.parseInt(session?.user?.id || "", 10)

    if (!session?.user?.id || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")

    const streams = await DashboardService.getRecentStreams(userId, limit)
    return NextResponse.json(streams)
  } catch (error) {
    console.error("Error fetching recent streams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
