import { NextResponse } from "next/server"
import { deleteSessionById, getSessionById } from "@/lib/session-store"

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(_req: Request, { params }: RouteContext) {
  const session = getSessionById(params.id)
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json(session)
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const deleted = deleteSessionById(params.id)
  if (!deleted) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
