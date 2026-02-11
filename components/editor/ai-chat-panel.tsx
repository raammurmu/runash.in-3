"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader, Copy, Trash2, ChevronDown, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type SessionStatus = "queued" | "streaming" | "tool-running" | "completed" | "failed"

interface TimelineEvent {
  id: string
  type: "tool_start" | "tool_result" | "notice"
  label: string
  timestamp: Date
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  status?: SessionStatus
  timeline?: TimelineEvent[]
}

interface AIChatPanelProps {
  isOpen: boolean
}

const HIGH_RISK_KEYWORDS = /(payment|account|external send|refund|checkout)/i

export default function AIChatPanel({ isOpen }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant. How can I help you with your video today?",
      timestamp: new Date(Date.now() - 5000),
      status: "completed",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("completed")
  const [confirmSensitiveActions, setConfirmSensitiveActions] = useState(true)
  const [pendingSensitivePrompt, setPendingSensitivePrompt] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const runAssistantFlow = (userInput: string) => {
    setSessionStatus("queued")
    setIsLoading(true)

    const timeline: TimelineEvent[] = [
      { id: "t1", type: "notice", label: "Request queued", timestamp: new Date() },
      { id: "t2", type: "tool_start", label: "Running context lookup", timestamp: new Date(Date.now() + 200) },
      { id: "t3", type: "tool_result", label: "Context lookup complete", timestamp: new Date(Date.now() + 350) },
    ]

    setTimeout(() => setSessionStatus("streaming"), 150)
    setTimeout(() => setSessionStatus("tool-running"), 350)

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(userInput),
        timestamp: new Date(),
        status: "completed",
        timeline,
      }
      setMessages((prev) => [...prev, aiResponse])
      setSessionStatus("completed")
      setIsLoading(false)
    }, 900)
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      status: "completed",
    }

    setMessages((prev) => [...prev, userMessage])

    const isSensitive = HIGH_RISK_KEYWORDS.test(input)
    const currentInput = input
    setInput("")

    if (isSensitive && confirmSensitiveActions) {
      setPendingSensitivePrompt(currentInput)
      setSessionStatus("queued")
      return
    }

    runAssistantFlow(currentInput)
  }

  const generateAIResponse = (userInput: string): string => {
    const responses: Record<string, string> = {
      generate: "I'll generate a video based on your prompt. Let me create something awesome!",
      edit: "I can help you edit your video. What changes would you like to make?",
      style: "I can apply different styles to your video. Try cinematic, documentary, or animated.",
      duration: "I can adjust the video duration. What length would you like?",
      default: "That's a great idea! I can help you with that. Just let me know what you'd like to do.",
    }

    const key = Object.keys(responses).find((k) => userInput.toLowerCase().includes(k)) as string | undefined

    return responses[key || "default"]
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Chat cleared. How can I help you?",
        timestamp: new Date(),
        status: "completed",
      },
    ])
    setSessionStatus("completed")
    setPendingSensitivePrompt(null)
  }

  const statusBadgeVariant: Record<SessionStatus, "default" | "secondary" | "destructive" | "outline"> = {
    queued: "outline",
    streaming: "secondary",
    "tool-running": "secondary",
    completed: "default",
    failed: "destructive",
  }

  if (!isOpen) return null

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
            <div className="mt-1">
              <Badge variant={statusBadgeVariant[sessionStatus]} className="text-[10px] capitalize">
                {sessionStatus}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClearChat} title="Clear chat">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              ref={message.id === messages[messages.length - 1].id ? scrollRef : null}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none border border-border"
                }`}
              >
                <p className="leading-relaxed text-balance">{message.content}</p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.role === "assistant" && (
                    <button
                      onClick={() => handleCopyMessage(message.content)}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                      title="Copy message"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {message.timeline && message.timeline.length > 0 && (
                  <Collapsible className="mt-2 border-t border-border/60 pt-2">
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <ChevronDown className="h-3 w-3" />
                      Tool activity timeline
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-1">
                      {message.timeline.map((event) => (
                        <div key={event.id} className="text-xs text-muted-foreground flex justify-between gap-2">
                          <span>{event.label}</span>
                          <span>{event.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          ))}

          {pendingSensitivePrompt && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Confirmation required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This request may perform a sensitive action. Confirm before execution.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        runAssistantFlow(pendingSensitivePrompt)
                        setPendingSensitivePrompt(null)
                      }}
                    >
                      Confirm
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPendingSensitivePrompt(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg rounded-bl-none px-4 py-2 border border-border">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">AI is processing…</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="sm" className="gap-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={confirmSensitiveActions}
            onChange={(e) => setConfirmSensitiveActions(e.target.checked)}
            className="h-3 w-3"
          />
          Require explicit confirmation for sensitive actions
        </label>
      </div>
    </div>
  )
}
