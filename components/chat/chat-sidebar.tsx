"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Trash2 } from "lucide-react"
import type { ChatSession } from "@/types/runash-chat"

interface ChatSidebarProps {
  sessions: ChatSession[]
  onSessionSelect: (session: ChatSession) => void
  currentSession: ChatSession | null
}

export default function ChatSidebar({ sessions, onSessionSelect, currentSession }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const fallbackSessions: ChatSession[] = [
    {
      id: "1",
      title: "Organic Breakfast Ideas",
      messages: [],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
      context: {
        preferences: {
          dietaryRestrictions: ["vegan"],
          sustainabilityPriority: "high",
          budgetRange: [0, 50],
          preferredCategories: ["fruits-vegetables"],
          cookingSkillLevel: "beginner",
        },
        currentCart: [],
        recentSearches: ["organic oats", "plant milk"],
      },
    },
    {
      id: "2",
      title: "Store Automation Setup",
      messages: [],
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
      context: {
        preferences: {
          dietaryRestrictions: [],
          sustainabilityPriority: "medium",
          budgetRange: [0, 1000],
          preferredCategories: [],
          cookingSkillLevel: "intermediate",
          businessType: "retail",
        },
        currentCart: [],
        recentSearches: ["inventory management", "POS system"],
      },
    },
    {
      id: "3",
      title: "Sustainable Living Tips",
      messages: [],
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 259200000),
      context: {
        preferences: {
          dietaryRestrictions: [],
          sustainabilityPriority: "high",
          budgetRange: [0, 100],
          preferredCategories: [],
          cookingSkillLevel: "advanced",
        },
        currentCart: [],
        recentSearches: ["zero waste", "renewable energy"],
      },
    },
  ]

  const availableSessions = sessions.length > 0 ? sessions : fallbackSessions
  const filteredSessions = availableSessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleNewChat = () => {
    // Create new chat session
    console.log("Create new chat")
  }

  const handleDeleteSession = (sessionId: string) => {
    // Delete session
    console.log("Delete session:", sessionId)
  }

  const getSessionIcon = (session: ChatSession) => {
    if (session.context.preferences.businessType) {
      return "🏪"
    }
    if (session.context.recentSearches.some((search) => search.includes("recipe") || search.includes("cook"))) {
      return "👨‍🍳"
    }
    if (session.context.preferences.sustainabilityPriority === "high") {
      return "🌱"
    }
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
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  currentSession?.id === session.id ? "bg-muted border-orange-500" : ""
                }`}
                onClick={() => onSessionSelect(session)}
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
