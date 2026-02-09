import { NextRequest, NextResponse } from "next/server"

interface ChatRespondRequest {
  sessionId?: string
  requestId?: string
  message?: {
    id?: string
    content?: string
    role?: "user"
    timestamp?: string
  }
}

const idempotentResponses = new Map<string, {
  sessionId: string
  requestId: string
  message: {
    id: string
    content: string
    role: "assistant"
    timestamp: string
    type: "text" | "product" | "recipe" | "tip" | "automation"
    metadata?: Record<string, unknown>
  }
}>()

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ChatRespondRequest

    if (!payload.sessionId || !payload.requestId || !payload.message?.content) {
      return NextResponse.json({ error: "sessionId, requestId, and message.content are required" }, { status: 400 })
    }

    const cacheKey = `${payload.sessionId}:${payload.requestId}`
    const existing = idempotentResponses.get(cacheKey)
    if (existing) {
      return NextResponse.json(existing)
    }

    const response = {
      sessionId: payload.sessionId,
      requestId: payload.requestId,
      message: {
        id: `${payload.sessionId}:assistant:${payload.requestId}`,
        content: `I received your message: "${payload.message.content}". This response came from /api/chat/respond.`,
        role: "assistant" as const,
        timestamp: new Date().toISOString(),
        type: "text" as const,
        metadata: {
          source: "server",
          userMessageId: payload.message.id,
        },
      },
    }

    idempotentResponses.set(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Chat respond error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
