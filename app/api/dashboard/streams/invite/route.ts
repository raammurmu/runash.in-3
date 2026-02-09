import { type NextRequest, NextResponse } from "next/server"
import { createStreamInvite } from "@/lib/repositories/dashboard-streams"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { streamId, email } = await request.json()
    if (!streamId || !email) {
      return NextResponse.json({ error: "Missing streamId or email" }, { status: 400 })
    }

    const invite = await createStreamInvite(Number.parseInt(userId, 10), streamId, email)
    if (!invite) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 })
    }

    console.log(`Invite sent to ${email} for stream ${streamId}`)

    return NextResponse.json({ ok: true, invite }, { status: 201 })
  } catch (error) {
    console.error("Error creating stream invite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
