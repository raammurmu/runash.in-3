import type { AutomationSuggestion, UserPreferences } from "../types/runash-chat"
import { getAiImageSet } from "./ai-image"

const AUTOMATION_SUGGESTION_SEED: AutomationSuggestion[] = [
  {
    id: "automation-1",
    title: "Demand-Aware Inventory Alerts",
    description: "Predict low-stock events and trigger replenishment reminders automatically.",
    category: "inventory",
    complexity: "moderate",
    estimatedROI: 34,
    implementationTime: "2-4 weeks",
    tools: ["Inventory dashboard", "Forecasting model", "Notification workflow"],
  },
  {
    id: "automation-2",
    title: "Dynamic Discount Rules",
    description: "Automatically mark down near-expiry items to reduce waste and recover margin.",
    category: "pricing",
    complexity: "moderate",
    estimatedROI: 29,
    implementationTime: "2-3 weeks",
    tools: ["POS integration", "Pricing engine", "Expiry scanner"],
  },
  {
    id: "automation-3",
    title: "Lifecycle Email Campaigns",
    description: "Send automated onboarding, reorder, and win-back sequences.",
    category: "marketing",
    complexity: "simple",
    estimatedROI: 26,
    implementationTime: "1-2 weeks",
    tools: ["CRM", "Email automation", "Audience segmentation"],
  },
  {
    id: "automation-4",
    title: "AI FAQ Assistant",
    description: "Resolve common delivery, return, and product questions instantly.",
    category: "customer-service",
    complexity: "simple",
    estimatedROI: 22,
    implementationTime: "1-2 weeks",
    tools: ["Knowledge base", "Chat widget", "LLM assistant"],
  },
  {
    id: "automation-5",
    title: "Executive KPI Digest",
    description: "Generate automated weekly KPI summaries and anomaly highlights.",
    category: "analytics",
    complexity: "advanced",
    estimatedROI: 31,
    implementationTime: "4-6 weeks",
    tools: ["BI platform", "Scheduled reports", "Alerting rules"],
  },
]

export const AUTOMATION_SUGGESTIONS: AutomationSuggestion[] = AUTOMATION_SUGGESTION_SEED.map((suggestion) => {
  const generatedImages = getAiImageSet({
    prompt: `${suggestion.title}. ${suggestion.description}`,
    seed: suggestion.id,
    alt: suggestion.imageAlt ?? suggestion.title,
  })

  return {
    ...suggestion,
    image: generatedImages.image || suggestion.image,
    imageHd: generatedImages.imageHd || suggestion.imageHd,
    imageThumb: generatedImages.imageThumb || suggestion.imageThumb,
    imageAlt: generatedImages.imageAlt || suggestion.imageAlt,
  }
})

export const getAutomationSuggestions = (input: string, prefs?: UserPreferences): AutomationSuggestion[] => {
  const query = input.toLowerCase()

  const scored = AUTOMATION_SUGGESTIONS.map((suggestion) => {
    let score = suggestion.estimatedROI

    if (query.includes(suggestion.category)) score += 6
    if (query.includes(suggestion.title.toLowerCase())) score += 4

    if (query.includes("quick") && suggestion.complexity === "simple") score += 3
    if (query.includes("advanced") && suggestion.complexity === "advanced") score += 3

    if (prefs?.businessType === "retail" && suggestion.category === "inventory") score += 2

    return { suggestion, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ suggestion }) => suggestion)
}
