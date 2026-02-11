import { type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { DatabaseService } from "@/lib/database"
import { authOptions } from "@/lib/auth"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
 
import { enforceDualQuota } from "@/lib/route-quota"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

import { respondError, respondSuccess } from "@/lib/api/envelope"


export const maxDuration = 30

export async function POST(request: NextRequest): Promise<Response> {
  const correlationId = request.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = request.headers.get("x-request-id") || generateCorrelationId()

 
  return withRequestContext({ correlationId, requestId, route: "/api/chat" }, async () => {
    try {
      const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return respondError(
        request,
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401, legacy: { error: "Unauthorized" } },
      )
    }


      if (!session?.user?.id) {
        logEvent("warn", "Unauthorized chat request")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

 
      const quotaResult = enforceDualQuota(request, "chat", {
        perIpLimit: 120,
        perUserLimit: 90,
        windowMs: 60_000,
        userId: session.user.id,
      })

    let systemPrompt = `You are RunAsh AI, a helpful assistant for the RunAsh platform. You help users with live streaming, grocery shopping, and platform features.`


      if (!quotaResult.allowed) {
        logEvent("warn", "Chat quota exceeded", { userId: session.user.id, resetAt: quotaResult.resetAt })
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
      }

 
      const { messages, context } = await request.json()

      let systemPrompt = `You are RunAsh AI, a helpful assistant for the RunAsh platform. You help users with live streaming, grocery shopping, and platform features.`

      if (context === "grocery") {
        systemPrompt += ` You specialize in helping users find organic products, providing nutritional information, suggesting recipes, and assisting with grocery shopping decisions. You can recommend products based on dietary preferences, sustainability goals, and health needs.`
      } else if (context === "streaming") {
        systemPrompt += ` You specialize in helping users with live streaming setup, technical issues, content creation tips, and platform features. You can assist with streaming software, hardware recommendations, and audience engagement strategies.`
      }

      logEvent("info", "Processing chat request", {
        messageCount: Array.isArray(messages) ? messages.length : 0,
        context,
        userId: session.user.id,
      })

    const result = streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return respondError(
      request,
      { code: "INTERNAL_ERROR", message: "Internal Server Error" },
      { status: 500, legacy: { error: "Internal Server Error" } },
    )
  }
}


      const result = streamText({
        model: openai("gpt-4-turbo"),
        system: systemPrompt,
        messages,
        temperature: 0.7,
        maxTokens: 1000,
      })


      return result.toDataStreamResponse({
        headers: {
          "x-correlation-id": correlationId,
          "x-request-id": requestId,
        },
      })
    } catch (error) {
      logEvent("error", "Chat API error", { error: serializeError(error) })
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })

    if (!streamId) {
      return respondError(
        request,
        { code: "STREAM_ID_REQUIRED", message: "Stream ID required" },
        { status: 400, legacy: { error: "Stream ID required" } },
      )

    }
  })
}

export async function GET(request: NextRequest): Promise<Response> {
  const correlationId = request.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = request.headers.get("x-request-id") || generateCorrelationId()

  return withRequestContext({ correlationId, requestId, route: "/api/chat" }, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const streamId = searchParams.get("streamId")
      const limit = Number.parseInt(searchParams.get("limit") || "50")
      const offset = Number.parseInt(searchParams.get("offset") || "0")

      if (!streamId) {
        return NextResponse.json({ error: "Stream ID required" }, { status: 400 })
      }

 
      const messages = await DatabaseService.getChatMessages(streamId, limit, offset)

      return NextResponse.json(
        {
          success: true,
          messages,
        },
        {
          headers: {
            "x-correlation-id": correlationId,
            "x-request-id": requestId,
          },
        },
      )
    } catch (error) {
      logEvent("error", "Get chat messages error", { error: serializeError(error) })
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })

    return respondSuccess(
      request,
      {
        messages,
      },
      {
        legacy: {
          success: true,
          messages,
        },
      },
    )
  } catch (error) {
    console.error("Get chat messages error:", error)
    return respondError(
      request,
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500, legacy: { error: "Internal server error" } },
    )
  }

}
