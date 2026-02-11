"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, Loader, Send, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isLoading?: boolean
  correlationId?: string
}

interface AIChatPanelProps {
  isOpen: boolean
}

type StreamEventPayload = {
  type?: "start" | "token" | "done" | "error"
  correlationId?: string
  delta?: string
  message?: string
}

export default function AIChatPanel({ isOpen }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant. How can I help you with your video today?",
      timestamp: new Date(Date.now() - 5000),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const parseStreamChunk = (chunk: string, onEvent: (payload: StreamEventPayload) => void) => {
    const events = chunk.split("\n\n")

    for (const eventBlock of events) {
      if (!eventBlock.trim()) {
        continue
      }

      const dataLine = eventBlock
        .split("\n")
        .find((line) => line.startsWith("data:"))
        ?.replace(/^data:\s?/, "")

      if (!dataLine) {
        continue
      }

      try {
        const payload = JSON.parse(dataLine) as StreamEventPayload
        onEvent(payload)
      } catch {
        // Ignore malformed event payloads to keep stream resilient.
      }
    }
  }

  const handleSendMessage = async () => {
    const content = input.trim()
    if (!content || isLoading) return

    const correlationId = crypto.randomUUID()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      correlationId,
    }

    const assistantMessageId = `${Date.now() + 1}`

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
        correlationId,
      },
    ])

    setInput("")
    setIsLoading(true)

    try {
      const conversation = [...messages, userMessage].map((message) => ({
        role: message.role,
        content: message.content,
      }))

      const response = await fetch("/api/v1/agents/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-correlation-id": correlationId,
        },
        body: JSON.stringify({
          messages: conversation,
          context: "streaming",
          tools: ["contentSearch"],
        }),
      })

      if (!response.ok || !response.body) {
        const fallback = "I ran into an issue while contacting the assistant. Please try again."
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId ? { ...message, content: fallback, isLoading: false } : message,
          ),
        )
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const completeBlocks = buffer.split("\n\n")
        buffer = completeBlocks.pop() || ""

        parseStreamChunk(completeBlocks.join("\n\n"), (payload) => {
          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== assistantMessageId) {
                return message
              }

              if (payload.type === "start") {
                return {
                  ...message,
                  correlationId: payload.correlationId || message.correlationId,
                }
              }

              if (payload.type === "token") {
                return {
                  ...message,
                  content: `${message.content}${payload.delta || ""}`,
                  isLoading: false,
                }
              }

              if (payload.type === "done") {
                return {
                  ...message,
                  isLoading: false,
                  correlationId: payload.correlationId || message.correlationId,
                }
              }

              if (payload.type === "error") {
                return {
                  ...message,
                  content: payload.message || "The assistant could not complete this response.",
                  isLoading: false,
                }
              }

              return message
            }),
          )
        })
      }

      if (buffer.trim()) {
        parseStreamChunk(buffer, (payload) => {
          if (payload.type === "error") {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: payload.message || "The assistant could not complete this response.",
                      isLoading: false,
                    }
                  : message,
              ),
            )
          }
        })
      }
    } catch {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: "I ran into a network error while replying. Please retry.",
                isLoading: false,
              }
            : message,
        ),
      )
    } finally {
      setIsLoading(false)
    }
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
      },
    ])
  }

  if (!isOpen) return null

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
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
                {message.isLoading && !message.content ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader className="w-4 h-4 animate-spin text-primary" />
                    <span>AI is thinking...</span>
                  </div>
                ) : (
                  <p className="leading-relaxed text-balance">{message.content}</p>
                )}
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
                {message.correlationId && message.role === "assistant" && (
                  <p className="mt-1 text-[10px] text-muted-foreground">Turn ID: {message.correlationId}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg rounded-bl-none px-4 py-2 border border-border">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Streaming response...</span>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void handleSendMessage()
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button onClick={() => void handleSendMessage()} disabled={!input.trim() || isLoading} size="sm" className="gap-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  )
}
