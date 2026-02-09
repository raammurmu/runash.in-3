import type { ChatMessage, SustainabilityTip, UserPreferences } from "@/types/runash-chat"

export const SUSTAINABILITY_TIPS: SustainabilityTip[] = [
  {
    id: "1",
    title: "Buy Local and Seasonal",
    description: "Choose locally grown, seasonal produce to reduce transportation emissions.",
    category: "food",
    impact: "high",
    difficulty: "easy",
    estimatedSavings: 25,
  },
  {
    id: "2",
    title: "Reduce Food Waste",
    description: "Plan meals and compost scraps to minimize waste.",
    category: "waste",
    impact: "high",
    difficulty: "medium",
    estimatedSavings: 40,
  },
  {
    id: "3",
    title: "Use Cold Water for Laundry",
    description: "Wash clothes with cold water to lower household energy use.",
    category: "energy",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: 18,
  },
]

const TIP_KEYWORDS = ["sustainable", "eco", "environment", "carbon"]

export function getSustainabilityTips(input: string, prefs?: UserPreferences): ChatMessage | null {
  const normalizedInput = input.toLowerCase()
  const shouldSuggest = TIP_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))

  if (!shouldSuggest) {
    return null
  }

  const tips = prefs?.sustainabilityPriority === "high"
    ? SUSTAINABILITY_TIPS.filter((tip) => tip.impact !== "low")
    : SUSTAINABILITY_TIPS

  return {
    id: Date.now().toString(),
    content: "Here are some sustainability tips to help reduce your environmental impact:",
    role: "assistant",
    timestamp: new Date(),
    type: "tip",
    metadata: {
      tips,
    },
  }
}
