import { NextResponse } from "next/server"
import { addMessageToSession, getSessionById } from "@/lib/session-store"

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(req: Request, { params }: RouteContext) {
  const session = getSessionById(params.id)
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Number.parseInt(searchParams.get("limit") || "0", 10)

  if (!Number.isNaN(limit) && limit > 0) {
    return NextResponse.json(session.messages.slice(-limit))
  }

  return NextResponse.json(session.messages)
}

export async function POST(req: Request, { params }: RouteContext) {
  const body = await req.json().catch(() => ({}))

  if (!body?.content || (body.role !== "user" && body.role !== "assistant")) {
    return NextResponse.json({ error: "Invalid message payload" }, { status: 400 })
  }

  const session = addMessageToSession(params.id, {
    role: body.role,
    content: body.content,
    type: body.type,
    metadata: body.metadata,
  })

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json(session.messages.at(-1), { status: 201 })
}
