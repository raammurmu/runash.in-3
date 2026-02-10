import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { deleteCustomDashboard, getCustomDashboardById, updateCustomDashboard } from "@/lib/custom-dashboard-service"
import type { DashboardLayout, DashboardWidget } from "@/types/custom-dashboard"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dashboard = await getCustomDashboardById(params.id, session.user.id)
    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error("Custom dashboards [id] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const dashboard = await updateCustomDashboard(params.id, session.user.id, {
      name: body.name,
      description: body.description,
      widgets: body.widgets,
      layout: body.layout,
      isShared: body.isShared,
      sharedWith: body.sharedWith,
    })

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error("Custom dashboards [id] PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deleted = await deleteCustomDashboard(params.id, session.user.id)
    if (!deleted) {
      return NextResponse.json({ error: "Dashboard not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Custom dashboards [id] DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
