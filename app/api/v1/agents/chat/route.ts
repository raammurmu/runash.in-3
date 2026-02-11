import { type NextRequest, NextResponse } from "next/server"
import { agentChatRequestSchema } from "@/lib/agents-types"
import { AgentsOrchestrator } from "@/lib/agents-orchestrator"
import { getAuthedUser, logAgentAudit } from "@/lib/agents-api"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  const auth = await getAuthedUser(request, ["content:write"])
  if (auth.error) return auth.error

  const parsed = agentChatRequestSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    await logAgentAudit({
      userId: Number(auth.userId),
      action: "agents_chat_validation_failed",
      resource: "agents_chat",
      success: false,
      details: { issues: parsed.error.issues },
    })
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of AgentsOrchestrator.runChat({
          sessionId: parsed.data.sessionId,
          message: parsed.data.message,
          toolPermissions: parsed.data.toolPermissions,
          userId: auth.userId,
        })) {
          controller.enqueue(encoder.encode(`event: ${event.type}\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }

        await logAgentAudit({
          userId: Number(auth.userId),
          action: "agents_chat_streamed",
          resource: "agents_chat",
          success: true,
          details: { sessionId: parsed.data.sessionId ?? null },
        })
      } catch (error) {
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "Failed to stream response" })}\n\n`),
        )
        await logAgentAudit({
          userId: Number(auth.userId),
          action: "agents_chat_failed",
          resource: "agents_chat",
          success: false,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
