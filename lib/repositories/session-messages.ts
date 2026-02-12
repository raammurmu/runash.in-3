import { one, queryMany, sql } from "@/lib/db"

export type ChatSessionMessage = {
  id: string | number
  session_id: string
  role: "assistant" | "user"
  content: string
  created_at?: string
  message_type?: "text" | "product" | "recipe" | "tip" | "automation"
}

export async function createChatSessionMessage(
  sessionId: string,
  role: ChatSessionMessage["role"],
  content: string,
  messageType?: ChatSessionMessage["message_type"],
): Promise<ChatSessionMessage> {
  const rows = await sql<ChatSessionMessage[]>`
    insert into runash_chat_session_messages (session_id, role, content, message_type)
    values (${sessionId}, ${role}, ${content}, ${messageType ?? "text"})
    returning id, session_id, role, content, created_at, message_type
  `

  await sql`
    update runash_chat_sessions
    set updated_at=now()
    where id=${sessionId}
  `

  return rows[0]
}

export async function listMessagesBySession(
  sessionId: string,
  limit?: number,
): Promise<ChatSessionMessage[]> {
  const hasLimit = typeof limit === "number" && Number.isFinite(limit) && limit > 0

  try {
    if (hasLimit) {
      return await queryMany<ChatSessionMessage>(
        `select id, session_id, role, content, created_at, message_type
         from runash_chat_session_messages
         where session_id=$1
         order by created_at desc, id desc
         limit $2`,
        [sessionId, Math.floor(limit as number)],
      )
    }

    return await queryMany<ChatSessionMessage>(
      `select id, session_id, role, content, created_at, message_type
       from runash_chat_session_messages
       where session_id=$1
       order by created_at desc, id desc`,
      [sessionId],
    )
  } catch {
    return []
  }
}

export async function getMessageBySession(
  sessionId: string,
  messageId: string | number,
): Promise<ChatSessionMessage | null> {
  return one<ChatSessionMessage>(sql<ChatSessionMessage[]>`
    select id, session_id, role, content, created_at, message_type
    from runash_chat_session_messages
    where session_id=${sessionId} and id=${messageId}
    limit 1
  `)
}


export async function deleteMessagesBySession(sessionId: string): Promise<number> {
  const rows = await sql<{ id: string | number }[]>`
    delete from runash_chat_session_messages
    where session_id=${sessionId}
    returning id
  `

  return rows.length
}
