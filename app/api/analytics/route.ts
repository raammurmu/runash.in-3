import { type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { respondError, respondSuccess } from "@/lib/api/envelope"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return respondError(
        req,
        { code: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401, legacy: { error: "Unauthorized" } },
      )
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "7d"

    let dateFilter = ""
    switch (period) {
      case "24h":
        dateFilter = "created_at >= NOW() - INTERVAL '24 hours'"
        break
      case "7d":
        dateFilter = "created_at >= NOW() - INTERVAL '7 days'"
        break
      case "30d":
        dateFilter = "created_at >= NOW() - INTERVAL '30 days'"
        break
      default:
        dateFilter = "created_at >= NOW() - INTERVAL '7 days'"
    }

    const streamAnalytics = await sql`
      SELECT 
        COUNT(*) as total_streams,
        AVG(viewer_count) as avg_viewers,
        SUM(viewer_count) as total_views,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as live_streams
      FROM streams 
      WHERE user_id = ${session.user.id} 
      AND ${sql.unsafe(dateFilter)}
    `

    const chatAnalytics = await sql`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT user_id) as unique_chatters,
        COUNT(CASE WHEN message_type = 'donation' THEN 1 END) as donations,
        COUNT(CASE WHEN message_type = 'follow' THEN 1 END) as new_followers
      FROM chat_messages cm
      JOIN streams s ON cm.stream_id = s.id
      WHERE s.user_id = ${session.user.id}
      AND cm.${sql.unsafe(dateFilter)}
    `

    const recordingAnalytics = await sql`
      SELECT 
        COUNT(*) as total_recordings,
        SUM(duration) as total_duration,
        AVG(duration) as avg_duration,
        SUM(file_size) as total_storage
      FROM recordings r
      JOIN streams s ON r.stream_id = s.id
      WHERE s.user_id = ${session.user.id}
      AND r.${sql.unsafe(dateFilter)}
    `

    const dailyBreakdown = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as streams,
        AVG(viewer_count) as avg_viewers
      FROM streams
      WHERE user_id = ${session.user.id}
      AND ${sql.unsafe(dateFilter)}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    const analyticsPayload = {
      streams: streamAnalytics[0],
      chat: chatAnalytics[0],
      recordings: recordingAnalytics[0],
      daily: dailyBreakdown,
    }

    return respondSuccess(req, analyticsPayload, { legacy: analyticsPayload })
  } catch (error) {
    console.error("Analytics error:", error)
    return respondError(
      req,
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500, legacy: { error: "Internal server error" } },
    )
  }
}
