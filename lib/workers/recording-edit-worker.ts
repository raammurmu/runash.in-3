import { neon } from "@neondatabase/serverless"
import { jobQueue } from "@/lib/job-queue"

const sql = neon(process.env.DATABASE_URL!)

let initialized = false

export function ensureRecordingEditWorkerRegistered() {
  if (initialized) return

  jobQueue.registerProcessor(
    "recording-edit-process",
    async (payload) => {
      const editId = String(payload.editId ?? "")
      if (!editId) {
        throw new Error("Missing editId in job payload")
      }

      await sql`
        UPDATE streams
        SET status = 'completed', updated_at = NOW()
        WHERE id = ${editId}
      `
    },
    {
      timeoutMs: 15_000,
      maxAttempts: 3,
    },
  )

  initialized = true
}
