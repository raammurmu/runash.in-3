import fs from "fs"
import path from "path"

import {
  createChatSession,
  deleteChatSession,
  getMostRecentChatSession,
  listChatSessions,
  type ChatSession,
} from "@/lib/repositories/sessions"
import {
  createChatSessionMessage,
  deleteMessagesBySession,
  listMessagesBySession,
  type ChatSessionMessage,
} from "@/lib/repositories/session-messages"

const DATA_DIR = path.join(process.cwd(), "data")
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json")
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json")
const DEFAULT_USER_ID = "anonymous"

const useDatabaseBackedChatStorage = process.env.RUNASH_CHAT_DB_REPOSITORY_ENABLED === "true"

export type RunashSession = Pick<ChatSession, "id" | "title" | "created_at">

export type RunashSessionMessage = ChatSessionMessage

function ensureDataFile(filePath: string, initialValue: string) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, initialValue)
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureDataFile(filePath, JSON.stringify(fallback))

  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJsonFile<T>(filePath: string, value: T) {
  ensureDataFile(filePath, JSON.stringify(Array.isArray(value) ? [] : {}))
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2))
}

function resolveUserId(userId?: string | null) {
  const normalized = String(userId ?? "").trim()
  return normalized || DEFAULT_USER_ID
}

function mapSession(session: ChatSession): RunashSession {
  return {
    id: session.id,
    title: session.title,
    created_at: session.created_at,
  }
}

export async function listSessions(userId?: string): Promise<RunashSession[]> {
  if (useDatabaseBackedChatStorage) {
    const sessions = await listChatSessions(resolveUserId(userId))
    return sessions.map(mapSession)
  }

  return readJsonFile<RunashSession[]>(SESSIONS_FILE, [])
}

export async function createSession(title = "Session", userId?: string): Promise<RunashSession> {
  if (useDatabaseBackedChatStorage) {
    const session = await createChatSession(resolveUserId(userId), title)
    return mapSession(session)
  }

  const sessions = await listSessions()
  const newSession: RunashSession = {
    id: `s-${Date.now()}`,
    title,
    created_at: new Date().toISOString(),
  }

  sessions.unshift(newSession)
  writeJsonFile(SESSIONS_FILE, sessions)

  return newSession
}

export async function getMostRecentSession(userId?: string): Promise<RunashSession | null> {
  if (useDatabaseBackedChatStorage) {
    const session = await getMostRecentChatSession(resolveUserId(userId))
    return session ? mapSession(session) : null
  }

  const sessions = await listSessions()
  return sessions[0] ?? null
}

export async function listSessionMessages(sessionId: string, limit?: number): Promise<RunashSessionMessage[]> {
  if (useDatabaseBackedChatStorage) {
    return listMessagesBySession(String(sessionId), limit)
  }

  const messages = readJsonFile<RunashSessionMessage[]>(MESSAGES_FILE, [])
  const normalizedSessionId = String(sessionId)

  const filtered = messages
    .filter((message) => String(message.session_id) === normalizedSessionId)
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })

  if (!limit || limit < 1) return filtered
  return filtered.slice(0, limit)
}

export async function createSessionMessage(
  sessionId: string,
  role: RunashSessionMessage["role"],
  content: string,
  messageType: RunashSessionMessage["message_type"] = "text",
): Promise<RunashSessionMessage> {
  if (useDatabaseBackedChatStorage) {
    return createChatSessionMessage(sessionId, role, content, messageType)
  }

  const messages = readJsonFile<RunashSessionMessage[]>(MESSAGES_FILE, [])
  const newMessage: RunashSessionMessage = {
    id: Date.now(),
    session_id: String(sessionId),
    role,
    content,
    created_at: new Date().toISOString(),
    message_type: messageType,
  }

  messages.unshift(newMessage)
  writeJsonFile(MESSAGES_FILE, messages)

  return newMessage
}


export async function deleteSession(sessionId: string, userId?: string): Promise<boolean> {
  if (useDatabaseBackedChatStorage) {
    await deleteMessagesBySession(String(sessionId))
    return deleteChatSession(resolveUserId(userId), String(sessionId))
  }

  const normalizedSessionId = String(sessionId)
  const sessions = await listSessions()
  const nextSessions = sessions.filter((session) => String(session.id) !== normalizedSessionId)
  writeJsonFile(SESSIONS_FILE, nextSessions)

  const messages = readJsonFile<RunashSessionMessage[]>(MESSAGES_FILE, [])
  const nextMessages = messages.filter((message) => String(message.session_id) !== normalizedSessionId)
  writeJsonFile(MESSAGES_FILE, nextMessages)

  return nextSessions.length !== sessions.length
}
