import type { AutomationSuggestion, Product, Recipe, SustainabilityTip } from "@/types/runash-chat"

export const productRecommendations: Product[] = [
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
]

export const recipeSuggestions: Recipe[] = [
  {
    id: "1",
    name: "Organic Quinoa Buddha Bowl",
    description: "A nutritious and colorful bowl with organic quinoa, seasonal vegetables, and tahini dressing",
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
]

export const sustainabilityTips: SustainabilityTip[] = [
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
]

export const automationSuggestions: AutomationSuggestion[] = [
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
]

export const providerKeywords = {
  product: ["organic", "product", "buy"],
  recipe: ["recipe", "cook", "meal"],
  tip: ["sustainable", "eco", "environment", "carbon"],
  automation: ["automat", "business", "retail", "inventory"],
} as const
