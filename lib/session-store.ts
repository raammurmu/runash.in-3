import fs from "fs"
import path from "path"

export interface SessionMessageRecord {
  id: string
  role: "user" | "assistant"
  content: string
  type?: "text" | "product" | "recipe" | "tip" | "automation"
  metadata?: Record<string, unknown>
  created_at: string
}

export interface SessionContextRecord {
  preferences: {
    dietaryRestrictions: string[]
    sustainabilityPriority: "low" | "medium" | "high"
    budgetRange: [number, number]
    preferredCategories: string[]
    cookingSkillLevel: "beginner" | "intermediate" | "advanced"
    businessType?: "retail" | "restaurant" | "farm" | "distributor"
  }
  currentCart: unknown[]
  recentSearches: string[]
}

export interface SessionRecord {
  id: string
  title: string
  created_at: string
  updated_at: string
  context: SessionContextRecord
  messages: SessionMessageRecord[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, "[]")
}

function normalizeSession(input: Partial<SessionRecord>): SessionRecord {
  const now = new Date().toISOString()

  return {
    id: input.id || `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title || "Untitled chat",
    created_at: input.created_at || now,
    updated_at: input.updated_at || input.created_at || now,
    context: {
      preferences: {
        dietaryRestrictions: input.context?.preferences?.dietaryRestrictions || [],
        sustainabilityPriority: input.context?.preferences?.sustainabilityPriority || "medium",
        budgetRange: input.context?.preferences?.budgetRange || [0, 100],
        preferredCategories: input.context?.preferences?.preferredCategories || [],
        cookingSkillLevel: input.context?.preferences?.cookingSkillLevel || "intermediate",
        businessType: input.context?.preferences?.businessType,
      },
      currentCart: input.context?.currentCart || [],
      recentSearches: input.context?.recentSearches || [],
    },
    messages: Array.isArray(input.messages)
      ? input.messages.map((message) => ({
          id: message.id || `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content || "",
          type: message.type,
          metadata: message.metadata,
          created_at: message.created_at || now,
        }))
      : [],
  }
}

export function readSessions(): SessionRecord[] {
  ensureDataDir()
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map((session) => normalizeSession(session)).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
  } catch {
    return []
  }
}

export function writeSessions(sessions: SessionRecord[]) {
  ensureDataDir()
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

export function createSession(payload: Partial<SessionRecord> = {}): SessionRecord {
  const sessions = readSessions()
  const now = new Date().toISOString()
  const newSession = normalizeSession({
    ...payload,
    created_at: now,
    updated_at: now,
    messages: payload.messages || [],
  })

  sessions.unshift(newSession)
  writeSessions(sessions)
  return newSession
}

export function getSessionById(id: string): SessionRecord | null {
  return readSessions().find((session) => session.id === id) || null
}

export function deleteSessionById(id: string): boolean {
  const sessions = readSessions()
  const nextSessions = sessions.filter((session) => session.id !== id)
  if (nextSessions.length === sessions.length) return false
  writeSessions(nextSessions)
  return true
}

export function addMessageToSession(
  sessionId: string,
  message: Omit<SessionMessageRecord, "id" | "created_at"> & Partial<Pick<SessionMessageRecord, "id" | "created_at">>,
): SessionRecord | null {
  const sessions = readSessions()
  const session = sessions.find((item) => item.id === sessionId)
  if (!session) return null

  const createdAt = message.created_at || new Date().toISOString()
  const nextMessage: SessionMessageRecord = {
    id: message.id || `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: message.role,
    content: message.content,
    type: message.type,
    metadata: message.metadata,
    created_at: createdAt,
  }

  session.messages.push(nextMessage)
  session.updated_at = createdAt

  writeSessions(sessions)
  return session
}
