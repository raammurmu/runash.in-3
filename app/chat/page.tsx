"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Send, Sparkles, Leaf, Settings, History, Bot, Mic } from "lucide-react"
import type { ChatMessage, ChatSession, UserPreferences, QuickAction } from "@/types/runash-chat"
import ChatMessageComponent from "@/components/chat/chat-message"
import QuickActions from "@/components/chat/quick-actions"
import ChatSidebar from "@/components/chat/chat-sidebar"
import UserPreferencesDialog from "@/components/chat/user-preferences-dialog"
import CartDrawer from "@/components/cart/cart-drawer"
import VoiceControls from "@/components/chat/voice-controls"

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
    const input = userInput.toLowerCase()

    // Product recommendations
    if (input.includes("organic") || input.includes("product") || input.includes("buy")) {
      return {
        id: Date.now().toString(),
        content: "Here are some organic products I recommend based on your preferences:",
        role: "assistant",
        timestamp: new Date(),
        type: "product",
        metadata: {
          products: [
            {
              id: "1",
              name: "Organic Quinoa",
              description: "Premium organic quinoa, rich in protein and fiber",
              price: 12.99,
              category: "grains-cereals",
              isOrganic: true,
              sustainabilityScore: 9,
              image: "/placeholder.svg?height=200&width=200",
              inStock: true,
              certifications: ["USDA Organic", "Fair Trade"],
              carbonFootprint: 2.1,
            },
            {
              id: "2",
              name: "Organic Avocados",
              description: "Fresh organic avocados from sustainable farms",
              price: 8.99,
              category: "fruits-vegetables",
              isOrganic: true,
              sustainabilityScore: 8,
              image: "/placeholder.svg?height=200&width=200",
              inStock: true,
              certifications: ["USDA Organic"],
              carbonFootprint: 1.8,
            },
          ],
        },
      }
    }

    // Recipe suggestions
    if (input.includes("recipe") || input.includes("cook") || input.includes("meal")) {
      return {
        id: Date.now().toString(),
        content: "Here are some sustainable recipes perfect for your cooking level:",
        role: "assistant",
        timestamp: new Date(),
        type: "recipe",
        metadata: {
          recipes: [
            {
              id: "1",
              name: "Organic Quinoa Buddha Bowl",
              description:
                "A nutritious and colorful bowl with organic quinoa, seasonal vegetables, and tahini dressing",
              difficulty: "easy",
              prepTime: 15,
              cookTime: 20,
              servings: 2,
              ingredients: [
                { id: "1", name: "Organic Quinoa", amount: "1", unit: "cup", isOrganic: true },
                { id: "2", name: "Organic Kale", amount: "2", unit: "cups", isOrganic: true },
                { id: "3", name: "Organic Chickpeas", amount: "1", unit: "can", isOrganic: true },
              ],
              instructions: [
                "Rinse quinoa and cook according to package instructions",
                "Massage kale with olive oil and lemon juice",
                "Drain and rinse chickpeas",
                "Arrange all ingredients in bowls and drizzle with tahini dressing",
              ],
              image: "/placeholder.svg?height=300&width=400",
              tags: ["vegan", "gluten-free", "high-protein"],
              sustainabilityScore: 9,
              nutritionalInfo: {
                calories: 420,
                protein: 18,
                carbs: 65,
                fat: 12,
                fiber: 12,
                sugar: 8,
                sodium: 380,
              },
            },
          ],
        },
      }
    }

    // Sustainability tips
    if (
      input.includes("sustainable") ||
      input.includes("eco") ||
      input.includes("environment") ||
      input.includes("carbon")
    ) {
      return {
        id: Date.now().toString(),
        content: "Here are some sustainability tips to help reduce your environmental impact:",
        role: "assistant",
        timestamp: new Date(),
        type: "tip",
        metadata: {
          tips: [
            {
              id: "1",
              title: "Buy Local and Seasonal",
              description:
                "Choose locally grown, seasonal produce to reduce transportation emissions and support local farmers.",
              category: "food",
              impact: "high",
              difficulty: "easy",
              estimatedSavings: 25,
            },
            {
              id: "2",
              title: "Reduce Food Waste",
              description: "Plan meals, store food properly, and compost scraps to minimize waste.",
              category: "waste",
              impact: "high",
              difficulty: "medium",
              estimatedSavings: 40,
            },
          ],
        },
      }
    }

    // Automation suggestions
    if (
      input.includes("automat") ||
      input.includes("business") ||
      input.includes("retail") ||
      input.includes("inventory")
    ) {
      return {
        id: Date.now().toString(),
        content: "Here are automation suggestions to optimize your organic retail business:",
        role: "assistant",
        timestamp: new Date(),
        type: "automation",
        metadata: {
          automationSuggestions: [
            {
              id: "1",
              title: "Smart Inventory Management",
              description:
                "Implement AI-powered inventory tracking to predict demand and reduce waste of perishable organic products.",
              category: "inventory",
              complexity: "moderate",
              estimatedROI: 35,
              implementationTime: "2-4 weeks",
              tools: ["RFID tags", "Inventory software", "Demand forecasting AI"],
            },
            {
              id: "2",
              title: "Automated Customer Segmentation",
              description:
                "Use customer data to automatically segment buyers and send personalized organic product recommendations.",
              category: "marketing",
              complexity: "simple",
              estimatedROI: 28,
              implementationTime: "1-2 weeks",
              tools: ["CRM software", "Email automation", "Analytics platform"],
            },
          ],
        },
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      content:
        "I can help you with organic products, sustainable living tips, eco-friendly recipes, and retailing automation. What specific area would you like to explore?",
      role: "assistant",
      timestamp: new Date(),
      type: "text",
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden"
                aria-label="Toggle chat history"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={voiceEnabled ? "bg-green-100 text-green-700" : ""}
                aria-label={voiceEnabled ? "Disable voice input" : "Enable voice input"}
              >
                <Mic className="h-4 w-4 mr-2" />
                {voiceEnabled ? "Voice On" : "Voice Off"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex min-h-[calc(100vh-88px)] flex-1 gap-6 px-4 py-4 sm:py-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <ChatSidebar onSessionSelect={(session) => setCurrentSession(session)} currentSession={currentSession} />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
            <div className="h-full p-4">
              <ChatSidebar onSessionSelect={(session) => setCurrentSession(session)} currentSession={currentSession} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Chat Area */}
        <div className="mx-auto flex min-w-0 max-w-4xl flex-1">
          <Card className="flex min-h-[70vh] flex-1 flex-col sm:min-h-[calc(100vh-200px)]">
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
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about organic products, recipes, sustainability tips, or retail automation..."
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white"
                  aria-label="Send message"
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
