import { type NextRequest, NextResponse } from "next/server"
import { agentFeedbackSchema } from "@/lib/agents-types"
import { getSql } from "@/lib/db/neon"
import { getAuthedUser, logAgentAudit } from "@/lib/agents-api"

export async function POST(request: NextRequest) {
  const auth = await getAuthedUser(request, ["content:write"])
  if (auth.error) return auth.error

  const parsed = agentFeedbackSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 })
  }

  const sql = getSql()
  await sql`
    INSERT INTO agent_feedback (id, session_id, message_id, user_id, rating, category, notes, created_at)
    VALUES (gen_random_uuid(), ${parsed.data.sessionId}, ${parsed.data.messageId ?? null}, ${auth.userId}, ${parsed.data.rating}, ${parsed.data.category}, ${parsed.data.notes ?? null}, NOW())
  `

  await logAgentAudit({
    userId: Number(auth.userId),
    action: "agents_feedback_submitted",
    resource: "agents_feedback",
    success: true,
    details: { sessionId: parsed.data.sessionId, category: parsed.data.category },
  })

  return NextResponse.json({ success: true })
}
