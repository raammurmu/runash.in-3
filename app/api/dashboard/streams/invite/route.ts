import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { readData, writeData } from "../utils"
import type { InviteCollaboratorRequest, InviteCollaboratorResponse } from "@/lib/types/dashboard-streams"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as InviteCollaboratorRequest | null

  if (!body?.streamId || !body?.email) {
    return NextResponse.json({ error: "Missing streamId or email" }, { status: 400 })
  }

  const data = await readData()
  const invite = { id: uuidv4(), streamId: body.streamId, email: body.email, sentAt: new Date().toISOString() }

  data.invites = [invite, ...data.invites]
  await writeData(data)

  const payload: InviteCollaboratorResponse = {
    ok: true,
    inviteId: invite.id,
    streamId: invite.streamId,
    email: invite.email,
    sentAt: invite.sentAt,
  }

  return NextResponse.json(payload, { status: 201 })
}
