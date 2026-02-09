import type { AutomationSuggestion, ChatMessage, UserPreferences } from "@/types/runash-chat"

export const AUTOMATION_SUGGESTIONS: AutomationSuggestion[] = [
  {
    id: "1",
    title: "Smart Inventory Management",
    description: "Use demand forecasting to reduce waste on perishable products.",
    category: "inventory",
    complexity: "moderate",
    estimatedROI: 35,
    implementationTime: "2-4 weeks",
    tools: ["RFID tags", "Inventory software", "Forecasting AI"],
  },
  {
    id: "2",
    title: "Automated Customer Segmentation",
    description: "Segment buyers and trigger personalized campaigns automatically.",
    category: "marketing",
    complexity: "simple",
    estimatedROI: 28,
    implementationTime: "1-2 weeks",
    tools: ["CRM", "Email automation", "Analytics"],
  },
  {
    id: "3",
    title: "Behavior-Based Pricing Alerts",
    description: "Monitor trends and notify teams about pricing opportunities.",
    category: "pricing",
    complexity: "advanced",
    estimatedROI: 32,
    implementationTime: "4-8 weeks",
    tools: ["Data warehouse", "Pricing engine", "Alerting"],
  },
]

const AUTOMATION_KEYWORDS = ["automat", "business", "retail", "inventory"]

export function getAutomationSuggestions(input: string, prefs?: UserPreferences): ChatMessage | null {
  const normalizedInput = input.toLowerCase()
  const shouldSuggest = AUTOMATION_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))

  if (!shouldSuggest) {
    return null
  }

  const suggestions = prefs?.businessType ? AUTOMATION_SUGGESTIONS : AUTOMATION_SUGGESTIONS.slice(0, 2)

  return {
    id: Date.now().toString(),
    content: "Here are automation suggestions to optimize your organic retail business:",
    role: "assistant",
    timestamp: new Date(),
    type: "automation",
    metadata: {
      automationSuggestions: suggestions,
    },
  }
}
