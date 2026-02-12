import type { Recipe, UserPreferences } from "../types/runash-chat"
import { getAiImageSet } from "./ai-image"

const RECIPE_SUGGESTION_SEED: Recipe[] = [
  {
    id: "recipe-1",
    name: "Quinoa Veggie Power Bowl",
    description: "Balanced grain bowl with roasted vegetables and tahini dressing.",
    difficulty: "easy",
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    ingredients: [
      { id: "i-1", name: "quinoa", amount: "1", unit: "cup", isOrganic: true },
      { id: "i-2", name: "broccoli", amount: "2", unit: "cups", isOrganic: true },
      { id: "i-3", name: "chickpeas", amount: "1", unit: "cup", isOrganic: true },
    ],
    instructions: [
      "Cook quinoa according to package instructions.",
      "Roast broccoli and chickpeas with olive oil and salt.",
      "Assemble bowl and drizzle with tahini-lemon dressing.",
    ],
    image: "https://picsum.photos/seed/recipe-1/640/640",
    imageHd: "https://picsum.photos/seed/recipe-1-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/recipe-1-thumb/320/320",
    imageAlt: "Quinoa Veggie Power Bowl",
    tags: ["vegan", "high-protein", "meal-prep"],
    sustainabilityScore: 9,
    nutritionalInfo: {
      calories: 480,
      protein: 19,
      carbs: 62,
      fat: 18,
      fiber: 13,
      sugar: 6,
      sodium: 280,
    },
  },
  {
    id: "recipe-2",
    name: "Overnight Oats with Berries",
    description: "No-cook breakfast with oats, chia, and seasonal fruit.",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    ingredients: [
      { id: "i-4", name: "rolled oats", amount: "1/2", unit: "cup", isOrganic: true },
      { id: "i-5", name: "oat milk", amount: "3/4", unit: "cup", isOrganic: true },
      { id: "i-6", name: "berries", amount: "1/2", unit: "cup", isOrganic: true },
    ],
    instructions: [
      "Combine oats, chia, and oat milk in a jar.",
      "Refrigerate overnight.",
      "Top with berries before serving.",
    ],
    image: "https://picsum.photos/seed/recipe-2/640/640",
    imageHd: "https://picsum.photos/seed/recipe-2-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/recipe-2-thumb/320/320",
    imageAlt: "Overnight Oats with Berries",
    tags: ["breakfast", "no-cook", "quick"],
    sustainabilityScore: 8,
    nutritionalInfo: {
      calories: 320,
      protein: 10,
      carbs: 45,
      fat: 11,
      fiber: 9,
      sugar: 9,
      sodium: 120,
    },
  },
  {
    id: "recipe-3",
    name: "Lentil Tomato Soup",
    description: "One-pot, budget-friendly soup using pantry staples.",
    difficulty: "medium",
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    ingredients: [
      { id: "i-7", name: "red lentils", amount: "1", unit: "cup", isOrganic: true },
      { id: "i-8", name: "tomatoes", amount: "2", unit: "cups", isOrganic: true },
      { id: "i-9", name: "onion", amount: "1", unit: "medium", isOrganic: true },
    ],
    instructions: [
      "Sauté onion and garlic in olive oil.",
      "Add lentils, tomatoes, and vegetable stock.",
      "Simmer until lentils are tender and blend lightly.",
    ],
    image: "https://picsum.photos/seed/recipe-3/640/640",
    imageHd: "https://picsum.photos/seed/recipe-3-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/recipe-3-thumb/320/320",
    imageAlt: "Lentil Tomato Soup",
    tags: ["comfort", "meal-prep", "budget"],
    sustainabilityScore: 9,
    nutritionalInfo: {
      calories: 290,
      protein: 15,
      carbs: 41,
      fat: 7,
      fiber: 12,
      sugar: 8,
      sodium: 420,
    },
  },
]

export const RECIPE_SUGGESTIONS: Recipe[] = RECIPE_SUGGESTION_SEED.map((recipe) => {
  const generatedImages = getAiImageSet({
    prompt: `${recipe.name}. ${recipe.description}`,
    seed: recipe.id,
    alt: recipe.imageAlt ?? recipe.name,
  })

  return {
    ...recipe,
    image: generatedImages.image || recipe.image,
    imageHd: generatedImages.imageHd || recipe.imageHd,
    imageThumb: generatedImages.imageThumb || recipe.imageThumb,
    imageAlt: generatedImages.imageAlt || recipe.imageAlt,
  }
})

export const getRecipeSuggestions = (input: string, prefs?: UserPreferences): Recipe[] => {
  const query = input.toLowerCase()

  const scored = RECIPE_SUGGESTIONS.map((recipe) => {
    let score = recipe.sustainabilityScore

    if (query.includes(recipe.name.toLowerCase())) score += 6
    if (recipe.tags.some((tag) => query.includes(tag.toLowerCase()))) score += 3

    if (query.includes("quick") && recipe.prepTime + recipe.cookTime <= 30) score += 4
    if (query.includes("easy") && recipe.difficulty === "easy") score += 4

    if (prefs) {
      if (prefs.cookingSkillLevel === "beginner" && recipe.difficulty === "easy") score += 3
      if (prefs.sustainabilityPriority === "high" && recipe.sustainabilityScore >= 8) score += 3
    }

    return { recipe, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ recipe }) => recipe)
}
