import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { DashboardService } from "@/lib/dashboard-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = Number.parseInt(session?.user?.id || "", 10)

    if (!session?.user?.id || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await DashboardService.getDashboardStats(userId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
