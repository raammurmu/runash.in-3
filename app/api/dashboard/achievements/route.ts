import { type NextRequest, NextResponse } from "next/server"
import { DashboardService } from "@/lib/dashboard-service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievements = await DashboardService.getAchievements(Number.parseInt(userId))
    return NextResponse.json(achievements)
  } catch (error) {
    console.error("Error fetching dashboard achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
