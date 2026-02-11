import { type NextRequest, NextResponse } from "next/server"
import { AgentsRepository } from "@/lib/agents-repository"
import { getAuthedUser, logAgentAudit } from "@/lib/agents-api"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedUser(request, ["content:read"])
  if (auth.error) return auth.error

  const { id } = await context.params
  const data = await AgentsRepository.getSession(id, auth.userId)

  if (!data) {
    await logAgentAudit({
      userId: Number(auth.userId),
      action: "agents_session_not_found",
      resource: "agents_session",
      success: false,
      details: { sessionId: id },
    })
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  await logAgentAudit({
    userId: Number(auth.userId),
    action: "agents_session_read",
    resource: "agents_session",
    success: true,
    details: { sessionId: id },
  })

  return NextResponse.json({ success: true, ...data })
}
