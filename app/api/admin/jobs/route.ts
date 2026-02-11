import { NextResponse } from "next/server"
import { jobQueue } from "@/lib/job-queue"

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: jobQueue.getMetrics(),
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const jobId = typeof body?.jobId === "string" ? body.jobId : ""

  if (!jobId) {
    return NextResponse.json({ error: "Missing required field: jobId" }, { status: 400 })
  }

  const replayed = jobQueue.replayDeadLetter(jobId)
  if (!replayed) {
    return NextResponse.json({ error: "Dead-letter job not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true, data: replayed })
}
