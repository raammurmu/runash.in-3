import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createCustomDashboard, getCustomDashboards } from "@/lib/custom-dashboard-service"
import type { DashboardLayout, DashboardWidget } from "@/types/custom-dashboard"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dashboards = await getCustomDashboards(session.user.id)
    return NextResponse.json({ dashboards })
  } catch (error) {
    console.error("Custom dashboards GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as {
      name?: string
      description?: string
      widgets?: DashboardWidget[]
      layout?: DashboardLayout
      isShared?: boolean
      sharedWith?: string[]
    }

    if (!body.name || !body.layout) {
      return NextResponse.json({ error: "name and layout are required" }, { status: 400 })
    }

    const dashboard = await createCustomDashboard({
      ownerId: session.user.id,
      name: body.name,
      description: body.description,
      widgets: body.widgets ?? [],
      layout: body.layout,
      isShared: body.isShared,
      sharedWith: body.sharedWith ?? [],
    })

    return NextResponse.json({ dashboard }, { status: 201 })
  } catch (error) {
    console.error("Custom dashboards POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
