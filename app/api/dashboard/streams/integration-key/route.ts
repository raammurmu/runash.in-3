import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { IntegrationKeyResponse } from "@/lib/types/dashboard-streams"

export async function POST() {
  const payload: IntegrationKeyResponse = {
    rtmpKey: `demo-${uuidv4()}`,
  }

  return NextResponse.json(payload)
}
