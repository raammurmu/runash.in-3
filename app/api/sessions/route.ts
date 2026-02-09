import { NextResponse } from "next/server"
import { createSession, readSessions } from "@/lib/session-store"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get("q") || "").trim().toLowerCase()
  const includeMessages = searchParams.get("includeMessages") === "true"

  const sessions = readSessions()
    .filter((session) => {
      if (!query) return true
      return session.title.toLowerCase().includes(query)
    })
    .map((session) =>
      includeMessages
        ? session
        : {
            id: session.id,
            title: session.title,
            created_at: session.created_at,
            updated_at: session.updated_at,
            context: session.context,
            message_count: session.messages.length,
          },
    )

  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const newSession = createSession({
    title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : "New Chat",
    context: body.context,
  })

  return NextResponse.json(newSession, { status: 201 })
}
