"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Bot } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ChatMessage {
  id: string
  user: {
    name: string
    isHost: boolean
    isBot: boolean
  }
  message: string
  timestamp: Date
}

interface StreamChatProps {
  isStreaming: boolean
}

export default function StreamChat({ isStreaming }: StreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [aiModeration, setAiModeration] = useState(true)

  // Simulate chat messages when streaming starts
  useEffect(() => {
    if (isStreaming) {
      const initialMessages: ChatMessage[] = [
        {
          id: "1",
          user: { name: "System", isHost: false, isBot: true },
          message: "Stream has started. Welcome everyone!",
          timestamp: new Date(),
        },
        {
          id: "2",
          user: { name: "AI Assistant", isHost: false, isBot: true },
          message: "I'll be helping moderate the chat and answer common questions.",
          timestamp: new Date(),
        },
      ]

      setMessages(initialMessages)

      // Simulate viewers joining and chatting
      const timer1 = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "3",
            user: { name: "Viewer1", isHost: false, isBot: false },
            message: "Hey! Excited for today's stream!",
            timestamp: new Date(),
          },
        ])
      }, 3000)

      const timer2 = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "4",
            user: { name: "Viewer2", isHost: false, isBot: false },
            message: "What are we covering today?",
            timestamp: new Date(),
          },
        ])
      }, 5000)

      const timer3 = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "5",
            user: { name: "AI Assistant", isHost: false, isBot: true },
            message:
              "Today's stream is about AI-enhanced live streaming features. The host will be demonstrating the new background removal and smart lighting tools.",
            timestamp: new Date(),
          },
        ])
      }, 7000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      setMessages([
        {
          id: "0",
          user: { name: "System", isHost: false, isBot: true },
          message: "Chat will be available when you start streaming.",
          timestamp: new Date(),
        },
      ])
    }
  }, [isStreaming])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !isStreaming) return

    const hostMessage: ChatMessage = {
      id: Date.now().toString(),
      user: { name: "You", isHost: true, isBot: false },
      message: newMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, hostMessage])
    setNewMessage("")

    // Simulate AI response
    if (newMessage.toLowerCase().includes("hello") || newMessage.toLowerCase().includes("hi")) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            user: { name: "AI Assistant", isHost: false, isBot: true },
            message: "The host says hello! Welcome to the stream everyone!",
            timestamp: new Date(),
          },
        ])
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-orange-100 dark:border-orange-900/20 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="h-4 w-4 text-orange-500 mr-2" />
          <span className="text-sm font-medium">AI Chat Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="ai-moderation" checked={aiModeration} onCheckedChange={setAiModeration} />
          <Label htmlFor="ai-moderation" className="text-xs">
            Moderation
          </Label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.user.isHost ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.user.isBot
                  ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
                  : msg.user.isHost
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="font-medium text-xs">{msg.user.name}</span>
                {msg.user.isHost && (
                  <Badge variant="outline" className="text-[10px] py-0 h-4 bg-white/20 border-white/40">
                    Host
                  </Badge>
                )}
                {msg.user.isBot && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 bg-orange-200/50 dark:bg-orange-800/50 border-orange-300 dark:border-orange-700"
                  >
                    <Sparkles className="h-2 w-2 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              <p>{msg.message}</p>
              <div className="text-right mt-1">
                <span className="text-[10px] opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-orange-100 dark:border-orange-900/20">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder={isStreaming ? "Type a message..." : "Start streaming to chat"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!isStreaming}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isStreaming || !newMessage.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {aiModeration && isStreaming && (
          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles className="h-3 w-3 mr-1 text-orange-500" />
            AI moderation is active
          </div>
        )}
      </div>
    </div>
  )
}
