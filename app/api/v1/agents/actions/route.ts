import { type NextRequest, NextResponse } from "next/server"
import { agentActionRequestSchema } from "@/lib/agents-types"
import { AgentsRepository } from "@/lib/agents-repository"
import { classifyActionRisk, requiresConfirmation } from "@/lib/agents-safety"
import { getAuthedUser, logAgentAudit } from "@/lib/agents-api"

export async function POST(request: NextRequest) {
  const auth = await getAuthedUser(request, ["content:write"])
  if (auth.error) return auth.error

  const parsed = agentActionRequestSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 })
  }

  const riskLevel = classifyActionRisk(parsed.data.actionType)
  const needsConfirmation = requiresConfirmation(parsed.data.actionType)

  if (needsConfirmation && !parsed.data.confirmationToken) {
    await AgentsRepository.logAction({
      sessionId: parsed.data.sessionId,
      userId: auth.userId,
      actionType: parsed.data.actionType,
      payload: parsed.data.payload,
      status: "pending_confirmation",
      riskLevel,
    })

    return NextResponse.json(
      {
        success: false,
        requiresConfirmation: true,
        confirmationReason: "This action can affect payments, account settings, or external recipients.",
      },
      { status: 409 },
    )
  }

  await AgentsRepository.logAction({
    sessionId: parsed.data.sessionId,
    userId: auth.userId,
    actionType: parsed.data.actionType,
    payload: parsed.data.payload,
    status: "completed",
    riskLevel,
  })

  await logAgentAudit({
    userId: Number(auth.userId),
    action: "agents_action_executed",
    resource: "agents_action",
    success: true,
    details: { actionType: parsed.data.actionType, riskLevel },
  })

  return NextResponse.json({ success: true, status: "completed", riskLevel })
}
