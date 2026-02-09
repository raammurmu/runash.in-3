import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { setStreamIntegrationKey } from "@/lib/repositories/dashboard-streams"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const streamId = body?.streamId
    const rtmpKey = `live_${uuidv4()}`

    if (streamId) {
      const updated = await setStreamIntegrationKey(Number.parseInt(userId, 10), streamId, rtmpKey)
      if (!updated) {
        return NextResponse.json({ error: "Stream not found" }, { status: 404 })
      }
    }

    return NextResponse.json({ rtmpKey })
  } catch (error) {
    console.error("Error generating integration key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
