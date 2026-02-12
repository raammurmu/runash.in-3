import { one, queryMany, sql } from "@/lib/db"

export type ChatSession = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export async function listChatSessions(userId: string, limit?: number): Promise<ChatSession[]> {
  const hasLimit = typeof limit === "number" && Number.isFinite(limit) && limit > 0

  try {
    if (hasLimit) {
      return await queryMany<ChatSession>(
        `select id, user_id, title, created_at, updated_at
         from runash_chat_sessions
         where user_id=$1
         order by updated_at desc, created_at desc
         limit $2`,
        [userId, Math.floor(limit as number)],
      )
    }

    return await queryMany<ChatSession>(
      `select id, user_id, title, created_at, updated_at
       from runash_chat_sessions
       where user_id=$1
       order by updated_at desc, created_at desc`,
      [userId],
    )
  } catch {
    return []
  }
}

export async function createChatSession(userId: string, title = "Session"): Promise<ChatSession> {
  const rows = await sql<ChatSession[]>`
    insert into runash_chat_sessions (user_id, title)
    values (${userId}, ${title})
    returning id, user_id, title, created_at, updated_at
  `

  return rows[0]
}

export async function getMostRecentChatSession(userId: string): Promise<ChatSession | null> {
  return one<ChatSession>(sql<ChatSession[]>`
    select id, user_id, title, created_at, updated_at
    from runash_chat_sessions
    where user_id=${userId}
    order by updated_at desc, created_at desc
    limit 1
  `)
}

export async function getChatSessionById(userId: string, sessionId: string): Promise<ChatSession | null> {
  return one<ChatSession>(sql<ChatSession[]>`
    select id, user_id, title, created_at, updated_at
    from runash_chat_sessions
    where user_id=${userId} and id=${sessionId}
    limit 1
  `)
}


export async function deleteChatSession(userId: string, sessionId: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    delete from runash_chat_sessions
    where user_id=${userId} and id=${sessionId}
    returning id
  `

  return rows.length > 0
}
