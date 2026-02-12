import type { SustainabilityTip, UserPreferences } from "../types/runash-chat"
import { getAiImageSet } from "./ai-image"

const SUSTAINABILITY_TIP_SEED: SustainabilityTip[] = [
  {
    id: "tip-1",
    title: "Batch Cook Weekly Meals",
    description: "Cooking in larger batches reduces food waste and energy usage.",
    category: "food",
    impact: "high",
    difficulty: "easy",
    estimatedSavings: 25,
  },
  {
    id: "tip-2",
    title: "Switch to LED Lighting",
    description: "Replace high-use bulbs with LEDs to reduce electricity usage.",
    category: "energy",
    impact: "high",
    difficulty: "easy",
    estimatedSavings: 35,
  },
  {
    id: "tip-3",
    title: "Install Low-Flow Faucet Aerators",
    description: "Lower water consumption without affecting usability.",
    category: "water",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: 15,
  },
  {
    id: "tip-4",
    title: "Choose Refill and Bulk Products",
    description: "Buy refill packs and bulk staples to reduce packaging waste.",
    category: "shopping",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: 20,
  },
  {
    id: "tip-5",
    title: "Compost Organic Waste",
    description: "Turn kitchen scraps into compost to reduce landfill emissions.",
    category: "waste",
    impact: "high",
    difficulty: "medium",
    estimatedSavings: 18,
  },
]

export const SUSTAINABILITY_TIPS: SustainabilityTip[] = SUSTAINABILITY_TIP_SEED.map((tip) => {
  const generatedImages = getAiImageSet({
    prompt: `${tip.title}. ${tip.description}`,
    seed: tip.id,
    alt: tip.imageAlt ?? tip.title,
  })

  return {
    ...tip,
    image: generatedImages.image || tip.image,
    imageHd: generatedImages.imageHd || tip.imageHd,
    imageThumb: generatedImages.imageThumb || tip.imageThumb,
    imageAlt: generatedImages.imageAlt || tip.imageAlt,
  }
})

export const getSustainabilityTips = (input: string, prefs?: UserPreferences): SustainabilityTip[] => {
  const query = input.toLowerCase()

  const scored = SUSTAINABILITY_TIPS.map((tip) => {
    let score = 0

    if (query.includes(tip.category)) score += 4
    if (query.includes(tip.title.toLowerCase())) score += 5

    if (query.includes("easy") && tip.difficulty === "easy") score += 2
    if (query.includes("high impact") && tip.impact === "high") score += 3

    if (prefs?.sustainabilityPriority === "high" && tip.impact === "high") score += 2

    return { tip, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ tip }) => tip)
}
