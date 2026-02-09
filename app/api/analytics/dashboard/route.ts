import { NextResponse } from "next/server"
import { getDashboardData } from "@/lib/data-source"

export async function GET() {
  try {
    const data = await getDashboardData()
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("dashboard error", error)
    return NextResponse.json({ error: "failed to load dashboard data" }, { status: 500 })
  }
}
