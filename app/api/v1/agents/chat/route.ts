import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { authOptions } from "@/lib/auth"
import { RBACManager } from "@/lib/rbac"
import { rateLimit } from "@/lib/rate-limit"

export const maxDuration = 30

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatTurnRequest {
  messages?: ChatMessage[]
  context?: string
  tools?: string[]
}

const TOOL_PERMISSION_MAP: Record<string, string> = {
  streamControl: "streams:create",
  contentSearch: "content:read",
  moderation: "content:moderate",
}

function logChatEvent(event: string, payload: Record<string, unknown>) {
  console.info("[agents.chat]", {
    event,
    ...payload,
  })
}

function buildSystemPrompt(context?: string) {
  let systemPrompt =
    "You are RunAsh AI, a helpful assistant for the RunAsh platform. You help users with live streaming, grocery shopping, and platform features."

  if (context === "grocery") {
    systemPrompt +=
      " You specialize in helping users find organic products, providing nutritional information, suggesting recipes, and assisting with grocery shopping decisions."
  } else if (context === "streaming") {
    systemPrompt +=
      " You specialize in helping users with live streaming setup, technical issues, content creation tips, and platform features."
  }

  return systemPrompt
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID()
  const startedAt = Date.now()

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      logChatEvent("unauthorized", { correlationId })
      return NextResponse.json({ error: "Unauthorized", correlationId }, { status: 401 })
    }

    const userId = String(session.user.id)
    const rateLimitResult = await rateLimit(request, `agents-chat:${userId}`, 30, 60)

    if (!rateLimitResult.success) {
      logChatEvent("rate_limited", {
        correlationId,
        userId,
        resetTime: rateLimitResult.resetTime,
      })

      return NextResponse.json(
        { error: "Rate limit exceeded", correlationId, retryAt: rateLimitResult.resetTime },
        {
          status: 429,
          headers: {
            "x-correlation-id": correlationId,
          },
        },
      )
    }

    const body = (await request.json()) as ChatTurnRequest
    const messages = Array.isArray(body.messages) ? body.messages : []
    const context = body.context
    const requestedTools = Array.isArray(body.tools) ? body.tools : []

    if (messages.length === 0 || !messages.every((message) => message.role && typeof message.content === "string")) {
      return NextResponse.json({ error: "Invalid messages payload", correlationId }, { status: 400 })
    }

    const invalidTools = requestedTools.filter((tool) => !TOOL_PERMISSION_MAP[tool])
    if (invalidTools.length > 0) {
      logChatEvent("tool_validation_failed", {
        correlationId,
        userId,
        invalidTools,
      })
      return NextResponse.json({ error: "Invalid tool request", correlationId }, { status: 400 })
    }

    const requiredPermissions = [...new Set(requestedTools.map((tool) => TOOL_PERMISSION_MAP[tool]))]
    const userPermissions = await RBACManager.getUserPermissions(Number.parseInt(userId, 10))
    const missingPermissions = requiredPermissions.filter((permission) => !userPermissions.includes(permission))

    if (missingPermissions.length > 0) {
      logChatEvent("tool_permission_denied", {
        correlationId,
        userId,
        requestedTools,
        missingPermissions,
      })
      return NextResponse.json({ error: "Tool access denied", correlationId }, { status: 403 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const send = (type: string, data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        try {
          logChatEvent("turn_started", {
            correlationId,
            userId,
            context: context || "default",
            messageCount: messages.length,
            requestedTools,
          })

          send("meta", {
            type: "start",
            correlationId,
            createdAt: new Date().toISOString(),
          })

          const result = streamText({
            model: openai("gpt-4o-mini"),
            system: buildSystemPrompt(context),
            messages,
            temperature: 0.7,
            maxTokens: 1000,
          })

          let completionChars = 0

          for await (const delta of result.textStream) {
            completionChars += delta.length
            send("token", {
              type: "token",
              correlationId,
              delta,
            })
          }

          send("done", {
            type: "done",
            correlationId,
            completionChars,
          })

          logChatEvent("turn_completed", {
            correlationId,
            userId,
            latencyMs: Date.now() - startedAt,
            completionChars,
            requestedTools,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : "unknown_error"

          logChatEvent("turn_failed", {
            correlationId,
            userId,
            latencyMs: Date.now() - startedAt,
            error: message,
          })

          send("error", {
            type: "error",
            correlationId,
            message: "Failed to generate AI response",
          })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "x-correlation-id": correlationId,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error"

    logChatEvent("request_failed", {
      correlationId,
      latencyMs: Date.now() - startedAt,
      error: message,
    })

    return NextResponse.json(
      { error: "Internal Server Error", correlationId },
      {
        status: 500,
        headers: {
          "x-correlation-id": correlationId,
        },
      },
    )
  }
}
