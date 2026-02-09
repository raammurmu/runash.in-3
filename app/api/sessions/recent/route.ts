import { NextResponse } from "next/server"
import { readSessions } from "@/lib/session-store"

export async function GET() {
  const [recent] = readSessions()
  if (!recent) {
    return NextResponse.json({ error: "No sessions found" }, { status: 404 })
  }

  return NextResponse.json(recent)
}
