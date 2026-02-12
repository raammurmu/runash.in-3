import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { logApiEvent } from "@/lib/api/logging"
import { resolveRequestId } from "@/lib/api/response"
import { rateLimit } from "@/lib/rate-limit"
import {
  createAgentMessage,
  upsertAgentSession,
  updateAgentMessage,
} from "@/lib/repositories/agent-orchestration"
import { AgentOrchestrationService, type SupportedTool } from "@/services/agent-orchestration-service"
import { enqueueToolJob } from "@/services/agent-tool-queue-worker"
import { buildToolPlan } from "./chat-request-handler"

const requestSchema = z.object({
  sessionId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  message: z.string().trim().min(1).max(5000),
  tools: z.array(z.enum(["catalog_lookup", "inventory_health", "checkout_preview", "web_search"])).default([]),
})

const AGENT_CHAT_ENABLED = process.env.RUNASH_AGENT_CHAT_ENABLED !== "false"

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request)

  if (!AGENT_CHAT_ENABLED) {
    return NextResponse.json({ error: "Agent APIs disabled", requestId }, { status: 404 })
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 })
    }

    const userId = String(session.user.id)
    await AgentOrchestrationService.runRetentionSweep()
    const throttle = AgentOrchestrationService.enforceAdaptiveThrottle(`agents-chat:${userId}`, 45, 60_000)
    if (!throttle.allowed) {
      return NextResponse.json({ error: "Adaptive throttle limit exceeded", requestId }, { status: 429 })
    }

    const rateLimitResult = await rateLimit(request, `agents-chat:${userId}`, 30, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded", requestId }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error.flatten(), requestId }, { status: 400 })
    }

    const sanitizedMessage = AgentOrchestrationService.sanitizeUserInput(parsed.data.message)
    if (AgentOrchestrationService.hasPromptInjection(sanitizedMessage)) {
      return NextResponse.json({ error: "Prompt rejected by safety policy", requestId }, { status: 400 })
    }

    const agentSession = await upsertAgentSession(userId, parsed.data.sessionId, parsed.data.title)
    const userMessage = await createAgentMessage(agentSession.id, "user", sanitizedMessage, "completed")
    const assistantMessage = await createAgentMessage(agentSession.id, "assistant", "", "queued")

    const encoder = new TextEncoder()

    const eventStream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        try {
          send("final", { type: "meta", status: "queued", sessionId: agentSession.id, requestId })
          await updateAgentMessage(assistantMessage.id, { status: "streaming" })

          const toolOutputs: Record<string, unknown> = {}
          const toolPlan = buildToolPlan(parsed.data.tools as SupportedTool[])

          for (const tool of toolPlan.immediate) {
            send("tool_start", { tool, messageId: assistantMessage.id, status: "tool-running" })

            const execution = await AgentOrchestrationService.executeToolWithPolicy(tool, { query: sanitizedMessage }, {
              sessionId: agentSession.id,
              messageId: assistantMessage.id,
              tenantId: userId,
            })

            toolOutputs[tool] = execution.result
            send("tool_result", { tool, result: execution.result, fromCache: execution.fromCache })
          }

          for (const tool of toolPlan.queued) {
            send("tool_start", { tool, messageId: assistantMessage.id, status: "tool-running" })
            const jobId = enqueueToolJob({
              tool,
              payload: { query: sanitizedMessage },
              context: {
                sessionId: agentSession.id,
                messageId: assistantMessage.id,
                tenantId: userId,
              },
            })

            send("tool_result", {
              tool,
              result: { queued: true, jobId },
              fromCache: false,
            })
          }

          const completion = streamText({
            model: openai("gpt-4o-mini"),
            system:
              "You are RunAsh Agent. Keep answers concise, safe, and avoid exposing secrets. If tools are provided, ground your answer in tool results.",
            messages: [
              { role: "user", content: `User prompt: ${sanitizedMessage}` },
              { role: "system", content: `Tool outputs: ${JSON.stringify(toolOutputs)}` },
            ],
            temperature: 0.4,
            maxTokens: 700,
          })

          let fullText = ""
          for await (const token of completion.textStream) {
            fullText += token
            send("token", { token, messageId: assistantMessage.id })
          }

          await updateAgentMessage(assistantMessage.id, { status: "completed", content: fullText })
          send("final", {
            type: "final",
            status: "completed",
            sessionId: agentSession.id,
            messageId: assistantMessage.id,
            userMessageId: userMessage.id,
            content: fullText,
          })
        } catch (error) {
          await updateAgentMessage(assistantMessage.id, { status: "failed" })

          send("error", {
            message: "Unable to complete agent turn",
            requestId,
          })

          logApiEvent("error", "agents.chat.stream_failed", {
            requestId,
            route: "/api/agents/chat",
            method: "POST",
            userId,
            details: {},
            error,
          })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(eventStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "x-request-id": requestId,
      },
    })
  } catch (error) {
    logApiEvent("error", "agents.chat.failed", {
      requestId,
      route: "/api/agents/chat",
      method: "POST",
      details: {},
      error,
    })

    return NextResponse.json({ error: "Internal server error", requestId }, { status: 500 })
  }
}
