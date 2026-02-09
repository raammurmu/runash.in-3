import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export type ScheduledDashboardStream = {
  id: string
  title: string
  scheduled_start: string | null
  status: "scheduled"
  thumbnail_url: string | null
}

export type StreamInvite = {
  id: string
  stream_id: string
  user_id: string
  email: string
  sent_at: string
}

export async function listScheduledDashboardStreams(userId: number, limit = 20): Promise<ScheduledDashboardStream[]> {
  return sql<ScheduledDashboardStream[]>`
    SELECT id, title, scheduled_start, status, thumbnail_url
    FROM streams
    WHERE user_id = ${userId}
      AND status = 'scheduled'
    ORDER BY COALESCE(scheduled_start, created_at) ASC
    LIMIT ${limit}
  `
}

export async function createStreamInvite(userId: number, streamId: string, email: string): Promise<StreamInvite | null> {
  const rows = await sql<StreamInvite[]>`
    INSERT INTO stream_invites (id, stream_id, user_id, email, sent_at)
    SELECT ${uuidv4()}, s.id, s.user_id, ${email}, NOW()
    FROM streams s
    WHERE s.id = ${streamId}
      AND s.user_id = ${userId}
    RETURNING id, stream_id, user_id, email, sent_at
  `

  return rows[0] ?? null
}

export async function setStreamIntegrationKey(userId: number, streamId: string, streamKey: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE streams
    SET stream_key = ${streamKey}, updated_at = NOW()
    WHERE id = ${streamId}
      AND user_id = ${userId}
    RETURNING id
  `

  return rows.length > 0
}
