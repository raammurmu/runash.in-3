"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Send, Sparkles, Leaf, Settings, History, Bot, Mic } from "lucide-react"
import type { ChatMessage, ChatSession, UserPreferences, QuickAction } from "@/types/runash-chat"
import ChatMessageComponent from "@/components/chat/chat-message"
import QuickActions from "@/components/chat/quick-actions"
import ChatSidebar from "@/components/chat/chat-sidebar"
import UserPreferencesDialog from "@/components/chat/user-preferences-dialog"
import CartDrawer from "@/components/cart/cart-drawer"
import VoiceControls from "@/components/chat/voice-controls"
import { getProductRecommendations } from "@/lib/product-recommendations"
import { getRecipeSuggestions } from "@/lib/recipe-suggestions"
import { getSustainabilityTips } from "@/lib/sustainability-tips"
import { getAutomationSuggestions } from "@/lib/automation-suggestions"

export default function RunAshChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hello! I'm RunAshChat, your AI assistant for organic products, sustainable living, recipes, and retailing automation. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    sustainabilityPriority: "medium",
    budgetRange: [0, 100],
    preferredCategories: [],
    cookingSkillLevel: "intermediate",
  })

  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [autoSpeakResponses, setAutoSpeakResponses] = useState(false)

  const quickActions: QuickAction[] = [
    {
      id: "1",
      label: "Find Organic Products",
      icon: "leaf",
      action: () => handleQuickAction("Show me organic products for a healthy breakfast"),
      category: "product",
    },
    {
      id: "2",
      label: "Sustainable Recipes",
      icon: "chef-hat",
      action: () => handleQuickAction("Suggest eco-friendly recipes with seasonal ingredients"),
      category: "recipe",
    },
    {
      id: "3",
      label: "Sustainability Tips",
      icon: "lightbulb",
      action: () => handleQuickAction("Give me tips to reduce my carbon footprint"),
      category: "tip",
    },
    {
      id: "4",
      label: "Retail Automation",
      icon: "zap",
      action: () => handleQuickAction("Help me automate my organic store inventory"),
      category: "automation",
    },
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleQuickAction = (message: string) => {
    setInputValue(message)
    handleSendMessage(message)
  }

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim()
    if (!content) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(content)
      setMessages((prev) => [...prev, response])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): ChatMessage => {
    return (
      getProductRecommendations(userInput, userPreferences) ??
      getRecipeSuggestions(userInput, userPreferences) ??
      getSustainabilityTips(userInput, userPreferences) ??
      getAutomationSuggestions(userInput, userPreferences) ?? {
        id: Date.now().toString(),
        content:
          "I can help you with organic products, sustainable living tips, eco-friendly recipes, and retailing automation. What specific area would you like to explore?",
        role: "assistant",
        timestamp: new Date(),
        type: "text",
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript)
    handleSendMessage(transcript)
  }

  const handleSpeakResponse = (text: string) => {
    // This will be handled by the VoiceControls component
    console.log("Speaking:", text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-r from-orange-600 to-yellow-500 p-2">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 text-transparent bg-clip-text">
                  RunAshChat
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CartDrawer />
              <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={voiceEnabled ? "bg-green-100 text-green-700" : ""}
              >
                <Mic className="h-4 w-4 mr-2" />
                {voiceEnabled ? "Voice On" : "Voice Off"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80">
            <ChatSidebar onSessionSelect={(session) => setCurrentSession(session)} currentSession={currentSession} />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 max-w-4xl mx-auto">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            {/* Quick Actions */}
            <div className="p-4 border-b">
              <QuickActions actions={quickActions} />
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessageComponent key={message.id} message={message} />
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Voice Controls */}
            {voiceEnabled && (
              <div className="p-4 border-t">
                <VoiceControls
                  onVoiceInput={handleVoiceInput}
                  onSpeakResponse={handleSpeakResponse}
                  isEnabled={voiceEnabled}
                />
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about organic products, recipes, sustainability tips, or retail automation..."
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Leaf className="h-3 w-3 mr-1 text-green-500" />
                    Organic Focus
                  </span>
                  <span className="flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-orange-500" />
                    RunAsh AI 
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* User Preferences Dialog */}
      {showPreferences && (
        <UserPreferencesDialog
          preferences={userPreferences}
          onSave={setUserPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  )
}
