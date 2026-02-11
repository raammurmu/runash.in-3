import { randomUUID } from "crypto"
import { getSql } from "@/lib/db/neon"

export type StoredSession = {
  id: string
  userId: string
  status: string
  title: string
  rawOutput?: string
  renderedOutput?: string
  createdAt: string
  updatedAt: string
}

export class AgentsRepository {
  static async createOrGetSession(userId: string, sessionId?: string): Promise<StoredSession> {
    const sql = getSql()

    if (sessionId) {
      const existing = await sql`SELECT * FROM agent_sessions WHERE id = ${sessionId} AND user_id = ${userId} LIMIT 1`
      if (existing[0]) {
        return this.mapSession(existing[0])
      }
    }

    const id = randomUUID()
    const inserted = await sql`
      INSERT INTO agent_sessions (id, user_id, title, status, created_at, updated_at)
      VALUES (${id}, ${userId}, 'Agent Session', 'queued', NOW(), NOW())
      RETURNING *
    `

    return this.mapSession(inserted[0])
  }

  static async getSession(sessionId: string, userId: string) {
    const sql = getSql()
    const sessions = await sql`SELECT * FROM agent_sessions WHERE id = ${sessionId} AND user_id = ${userId} LIMIT 1`
    const messages = await sql`
      SELECT * FROM agent_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `
    const toolCalls = await sql`
      SELECT * FROM agent_tool_calls
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `

    if (!sessions[0]) return null

    return {
      session: this.mapSession(sessions[0]),
      messages,
      toolCalls,
    }
  }

  static async saveMessage(input: {
    sessionId: string
    userId: string
    role: "user" | "assistant"
    content: string
    rawOutput?: string
    renderedOutput?: string
  }) {
    const sql = getSql()
    const id = randomUUID()

    await sql`
      INSERT INTO agent_messages (id, session_id, user_id, role, content, raw_output, rendered_output, created_at)
      VALUES (
        ${id},
        ${input.sessionId},
        ${input.userId},
        ${input.role},
        ${input.content},
        ${input.rawOutput ?? null},
        ${input.renderedOutput ?? null},
        NOW()
      )
    `

    await sql`UPDATE agent_sessions SET updated_at = NOW() WHERE id = ${input.sessionId}`
    return id
  }

  static async saveToolCall(input: {
    sessionId: string
    userId: string
    toolName: string
    args: Record<string, unknown>
    result?: Record<string, unknown>
    status: string
    latencyMs?: number
  }) {
    const sql = getSql()
    const id = randomUUID()
    await sql`
      INSERT INTO agent_tool_calls (id, session_id, user_id, tool_name, tool_args, tool_result, status, latency_ms, created_at)
      VALUES (${id}, ${input.sessionId}, ${input.userId}, ${input.toolName}, ${JSON.stringify(input.args)}, ${JSON.stringify(input.result ?? {})}, ${input.status}, ${input.latencyMs ?? null}, NOW())
    `
    return id
  }

  static async logAction(input: {
    sessionId: string
    userId: string
    actionType: string
    payload: Record<string, unknown>
    status: string
    riskLevel: string
  }) {
    const sql = getSql()
    await sql`
      INSERT INTO agent_action_logs (id, session_id, user_id, action_type, payload, status, risk_level, created_at)
      VALUES (${randomUUID()}, ${input.sessionId}, ${input.userId}, ${input.actionType}, ${JSON.stringify(input.payload)}, ${input.status}, ${input.riskLevel}, NOW())
    `
  }

  static async updateSessionStatus(sessionId: string, status: string, renderedOutput?: string, rawOutput?: string) {
    const sql = getSql()
    await sql`
      UPDATE agent_sessions
      SET status = ${status}, rendered_output = ${renderedOutput ?? null}, raw_output = ${rawOutput ?? null}, updated_at = NOW()
      WHERE id = ${sessionId}
    `
  }

  private static mapSession(row: any): StoredSession {
    return {
      id: row.id,
      userId: String(row.user_id),
      title: row.title,
      status: row.status,
      rawOutput: row.raw_output ?? undefined,
      renderedOutput: row.rendered_output ?? undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }
  }
}
