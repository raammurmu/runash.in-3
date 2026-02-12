import { z } from "zod"

import { logApiEvent } from "@/lib/api/logging"
import { respondError, respondSuccess, resolveRequestId } from "@/lib/api/response"
import { createSessionMessage } from "@/lib/repositories/runash-chat"

const createMessageSchema = z.object({
  sessionId: z.string().trim().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(6000),
  messageType: z.enum(["text", "product", "recipe", "tip", "automation"]).optional(),
})

export async function POST(request: Request) {
  const requestId = resolveRequestId(request)

  try {
    const payload = await request.json().catch(() => ({}))
    const parsed = createMessageSchema.safeParse(payload)

    if (!parsed.success) {
      return respondError(
        request,
        { code: "INVALID_REQUEST", message: "sessionId, role and content are required" },
        { status: 400, requestId },
      )
    }

    const message = await createSessionMessage(
      parsed.data.sessionId,
      parsed.data.role,
      parsed.data.content,
      parsed.data.messageType ?? "text",
    )

    return respondSuccess(request, message, { status: 201, requestId })
  } catch (error) {
    logApiEvent("error", "messages.create.failed", {
      requestId,
      route: "/api/messages",
      method: "POST",
      details: {},
      error,
    })

    return respondError(request, { code: "MESSAGE_CREATE_FAILED", message: "Unable to store message" }, { status: 500, requestId })
  }
}
