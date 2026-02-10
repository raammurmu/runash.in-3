import type { ChatMessage } from "@/types/runash-chat"
import {
  automationSuggestions,
  productRecommendations,
  providerKeywords,
  recipeSuggestions,
  sustainabilityTips,
} from "@/lib/chat-response-providers"

type ProviderResolver = {
  matches: (normalizedInput: string) => boolean
  createMessage: () => ChatMessage
}

const includesKeyword = (input: string, keywords: readonly string[]) => keywords.some((keyword) => input.includes(keyword))

const providers: ProviderResolver[] = [
  {
    matches: (input) => includesKeyword(input, providerKeywords.product),
    createMessage: () => ({
      id: Date.now().toString(),
      content: "Here are some organic products I recommend based on your preferences:",
      role: "assistant",
      timestamp: new Date(),
      type: "product",
      metadata: {
        products: productRecommendations,
      },
    }),
  },
  {
    matches: (input) => includesKeyword(input, providerKeywords.recipe),
    createMessage: () => ({
      id: Date.now().toString(),
      content: "Here are some sustainable recipes perfect for your cooking level:",
      role: "assistant",
      timestamp: new Date(),
      type: "recipe",
      metadata: {
        recipes: recipeSuggestions,
      },
    }),
  },
  {
    matches: (input) => includesKeyword(input, providerKeywords.tip),
    createMessage: () => ({
      id: Date.now().toString(),
      content: "Here are some sustainability tips to help reduce your environmental impact:",
      role: "assistant",
      timestamp: new Date(),
      type: "tip",
      metadata: {
        tips: sustainabilityTips,
      },
    }),
  },
  {
    matches: (input) => includesKeyword(input, providerKeywords.automation),
    createMessage: () => ({
      id: Date.now().toString(),
      content: "Here are automation suggestions to optimize your organic retail business:",
      role: "assistant",
      timestamp: new Date(),
      type: "automation",
      metadata: {
        automationSuggestions,
      },
    }),
  },
]

export function generateChatResponse(userInput: string): ChatMessage {
  const normalizedInput = userInput.toLowerCase()
  const matchingProvider = providers.find((provider) => provider.matches(normalizedInput))

  if (matchingProvider) {
    return matchingProvider.createMessage()
  }

  return {
    id: Date.now().toString(),
    content:
      "I can help you with organic products, sustainable living tips, eco-friendly recipes, and retailing automation. What specific area would you like to explore?",
    role: "assistant",
    timestamp: new Date(),
    type: "text",
  }
}
