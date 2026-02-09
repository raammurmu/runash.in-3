import type { ChatMessage, Recipe, UserPreferences } from "@/types/runash-chat"

export const RECIPE_SUGGESTIONS: Recipe[] = [
  {
    id: "1",
    name: "Organic Quinoa Buddha Bowl",
    description: "A nutritious bowl with quinoa, seasonal vegetables, and tahini dressing.",
    difficulty: "easy",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    ingredients: [
      { id: "1", name: "Organic Quinoa", amount: "1", unit: "cup", isOrganic: true },
      { id: "2", name: "Organic Kale", amount: "2", unit: "cups", isOrganic: true },
      { id: "3", name: "Organic Chickpeas", amount: "1", unit: "can", isOrganic: true },
    ],
    instructions: ["Cook quinoa", "Massage kale", "Mix ingredients", "Serve with tahini dressing"],
    image: "/placeholder.svg?height=300&width=400",
    tags: ["vegan", "gluten-free", "high-protein"],
    sustainabilityScore: 9,
    nutritionalInfo: { calories: 420, protein: 18, carbs: 65, fat: 12, fiber: 12, sugar: 8, sodium: 380 },
  },
  {
    id: "2",
    name: "Zero-Waste Vegetable Soup",
    description: "A nourishing soup made from vegetable scraps to reduce kitchen waste.",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 40,
    servings: 4,
    ingredients: [
      { id: "4", name: "Vegetable Scraps", amount: "4", unit: "cups", isOrganic: true },
      { id: "5", name: "Onion", amount: "1", unit: "whole", isOrganic: true },
      { id: "6", name: "Garlic", amount: "2", unit: "cloves", isOrganic: true },
    ],
    instructions: ["Sauté onion and garlic", "Add scraps and water", "Simmer", "Blend and serve"],
    image: "/placeholder.svg?height=300&width=400",
    tags: ["zero-waste", "budget-friendly"],
    sustainabilityScore: 10,
    nutritionalInfo: { calories: 210, protein: 8, carbs: 34, fat: 5, fiber: 9, sugar: 7, sodium: 290 },
  },
]

const RECIPE_KEYWORDS = ["recipe", "cook", "meal"]

export function getRecipeSuggestions(input: string, prefs?: UserPreferences): ChatMessage | null {
  const normalizedInput = input.toLowerCase()
  const shouldSuggest = RECIPE_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))

  if (!shouldSuggest) {
    return null
  }

  const recipes = prefs?.cookingSkillLevel === "beginner"
    ? RECIPE_SUGGESTIONS.filter((recipe) => recipe.difficulty === "easy")
    : RECIPE_SUGGESTIONS

  return {
    id: Date.now().toString(),
    content: "Here are some sustainable recipes perfect for your cooking level:",
    role: "assistant",
    timestamp: new Date(),
    type: "recipe",
    metadata: {
      recipes,
    },
  }
}
