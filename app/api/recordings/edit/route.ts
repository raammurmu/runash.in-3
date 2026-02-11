import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { executeIdempotentMutation, getIdempotencyKeyFromHeaders } from "@/lib/idempotency"
import { jobQueue } from "@/lib/job-queue"
import { ensureRecordingEditWorkerRegistered } from "@/lib/workers/recording-edit-worker"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const idempotencyKey = getIdempotencyKeyFromHeaders(request.headers)
    if (!idempotencyKey) {
      return NextResponse.json({ error: "Missing required header: idempotency-key" }, { status: 400 })
    }

    const editedVideo = await request.json()
    ensureRecordingEditWorkerRegistered()

    const result = await executeIdempotentMutation({
      idempotencyKey,
      scope: `recordings:edit:${session.user.id}`,
      requestHash: JSON.stringify(editedVideo),
      execute: async () => {
        const insertResult = await sql`
          INSERT INTO streams (
            user_id, title, description, status,
            start_time, end_time, filters, audio_level,
            export_settings, original_stream_id, created_at
          ) VALUES (
            ${session.user.id}, ${editedVideo.title}, 'Edited version',
            'processing', ${editedVideo.startTime}, ${editedVideo.endTime},
            ${JSON.stringify(editedVideo.filters)}, ${editedVideo.audioLevel},
            ${JSON.stringify(editedVideo.exportSettings)}, ${editedVideo.originalId},
            NOW()
          ) RETURNING id
        `

        const editId = insertResult[0].id
        const job = jobQueue.enqueue("recording-edit-process", {
          editId,
          userId: session.user.id,
          originalId: editedVideo.originalId,
        })

        return {
          statusCode: 202,
          response: {
            success: true,
            editId,
            jobId: job.id,
            message: "Video edit queued for background processing",
          },
        }
      },
    })

    return NextResponse.json(result.response, { status: result.statusCode })
  } catch (error) {
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD") {
      return NextResponse.json({ error: "Idempotency key reuse detected with a different payload" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to save edited video" }, { status: 500 })
  }
}
