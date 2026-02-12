import { z } from "zod"

import { logApiEvent } from "@/lib/api/logging"
import { respondError, respondSuccess, resolveRequestId } from "@/lib/api/response"
import { deleteSession } from "@/lib/repositories/runash-chat"

const paramsSchema = z.object({
  id: z.string().trim().min(1),
})

function getRequestUserId(req: Request) {
  const userId = req.headers.get("x-runash-user-id")
  return typeof userId === "string" ? userId : undefined
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const requestId = resolveRequestId(req)
  const userId = getRequestUserId(req)

  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) {
    return respondError(req, { code: "INVALID_SESSION_ID", message: "Session id is required" }, { status: 400, requestId })
  }

  try {
    const removed = await deleteSession(parsed.data.id, userId)

    if (!removed) {
      return respondError(req, { code: "SESSION_NOT_FOUND", message: "Session not found" }, { status: 404, requestId })
    }

    return respondSuccess(req, { id: parsed.data.id, deleted: true }, { requestId })
  } catch (error) {
    logApiEvent("error", "sessions.delete.failed", {
      requestId,
      route: "/api/sessions/[id]",
      method: "DELETE",
      userId,
      details: { id: parsed.data.id },
      error,
    })

    return respondError(req, { code: "SESSION_DELETE_FAILED", message: "Unable to delete session" }, { status: 500, requestId })
  }
}
