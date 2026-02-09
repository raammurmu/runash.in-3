"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Trash2 } from "lucide-react"
import type { ChatMessage, ChatSession } from "@/types/runash-chat"

interface ChatSidebarProps {
  onSessionSelect: (session: ChatSession) => void
  currentSession: ChatSession | null
}

interface ApiChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  context: ChatSession["context"]
  messages?: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    type?: ChatMessage["type"]
    metadata?: ChatMessage["metadata"]
    created_at: string
  }>
}

function toChatSession(session: ApiChatSession): ChatSession {
  return {
    id: session.id,
    title: session.title,
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at),
    context: session.context,
    messages: Array.isArray(session.messages)
      ? session.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          type: message.type,
          metadata: message.metadata,
          timestamp: new Date(message.created_at),
        }))
      : [],
  }
}

export default function ChatSidebar({ onSessionSelect, currentSession }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/sessions")
        if (!res.ok) throw new Error("Failed to load sessions")

        const data = (await res.json()) as ApiChatSession[]
        setSessions(data.map(toChatSession))
      } catch (error) {
        console.error("Unable to load chat sessions", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [])

  const filteredSessions = useMemo(
    () => sessions.filter((session) => session.title.toLowerCase().includes(searchQuery.toLowerCase().trim())),
    [sessions, searchQuery],
  )

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      })

      if (!res.ok) throw new Error("Failed to create session")

      const created = toChatSession((await res.json()) as ApiChatSession)
      setSessions((prev) => [created, ...prev])
      onSessionSelect(created)
    } catch (error) {
      console.error("Unable to create chat session", error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = window.confirm("Delete this chat session? This cannot be undone.")
    if (!confirmed) return

    const previousSessions = sessions
    setPendingDeleteId(sessionId)
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete session")
    } catch (error) {
      console.error("Unable to delete chat session", error)
      setSessions(previousSessions)
    } finally {
      setPendingDeleteId(null)
    }
  }

  const handleSelectSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      if (!res.ok) throw new Error("Failed to load session")
      const fullSession = toChatSession((await res.json()) as ApiChatSession)
      onSessionSelect(fullSession)
      setSessions((prev) => prev.map((session) => (session.id === fullSession.id ? fullSession : session)))
    } catch (error) {
      console.error("Unable to load selected session", error)
    }
  }

  const getSessionIcon = (session: ChatSession) => {
    if (session.context.preferences.businessType) return "🏪"
    if (session.context.recentSearches.some((search) => search.includes("recipe") || search.includes("cook"))) return "👨‍🍳"
    if (session.context.preferences.sustainabilityPriority === "high") return "🌱"
    return "💬"
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat History</CardTitle>
          <Button size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2 p-3">
            {isLoading && <p className="text-sm text-muted-foreground">Loading sessions...</p>}
            {!isLoading && filteredSessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions found.</p>}

            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  currentSession?.id === session.id ? "bg-muted border-orange-500" : ""
                }`}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-lg">{getSessionIcon(session)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{session.title}</h4>
                    <p className="text-xs text-muted-foreground">{session.updatedAt.toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.context.preferences.businessType && (
                        <Badge variant="outline" className="text-xs">
                          Business
                        </Badge>
                      )}
                      {session.context.preferences.sustainabilityPriority === "high" && (
                        <Badge variant="outline" className="text-xs">
                          Eco-focused
                        </Badge>
                      )}
                      {session.context.preferences.dietaryRestrictions.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Dietary
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pendingDeleteId === session.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSession(session.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
