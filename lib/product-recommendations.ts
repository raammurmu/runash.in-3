import type { ChatMessage, Product, UserPreferences } from "@/types/runash-chat"

export const PRODUCT_RECOMMENDATIONS: Product[] = [
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
  {
    id: "3",
    name: "Organic Oat Milk",
    description: "Creamy organic oat milk, perfect for coffee and cereals",
    price: 3.49,
    category: "dairy-alternatives",
    isOrganic: true,
    sustainabilityScore: 9,
    image: "/placeholder.svg?height=200&width=200",
    inStock: true,
    certifications: ["USDA Organic", "Non-GMO Project"],
    carbonFootprint: 0.9,
  },
]

const PRODUCT_KEYWORDS = ["organic", "product", "buy"]

export function getProductRecommendations(input: string, prefs?: UserPreferences): ChatMessage | null {
  const normalizedInput = input.toLowerCase()
  const shouldRecommend = PRODUCT_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))

  if (!shouldRecommend) {
    return null
  }

  const [minBudget, maxBudget] = prefs?.budgetRange ?? [0, Number.POSITIVE_INFINITY]
  const preferredCategories = prefs?.preferredCategories ?? []

  const filteredProducts = PRODUCT_RECOMMENDATIONS.filter((product) => {
    const withinBudget = product.price >= minBudget && product.price <= maxBudget
    const categoryMatch = preferredCategories.length === 0 || preferredCategories.includes(product.category)
    return withinBudget && categoryMatch
  })

  return {
    id: Date.now().toString(),
    content: "Here are some organic products I recommend based on your preferences:",
    role: "assistant",
    timestamp: new Date(),
    type: "product",
    metadata: {
      products: filteredProducts.length > 0 ? filteredProducts : PRODUCT_RECOMMENDATIONS,
    },
  }
}
