import { groceryProducts, type Product as GroceryCatalogProduct } from "@/lib/grocery-products"
import type { Product, ProductCategory, UserPreferences } from "@/types/runash-chat"

const preferredCategoryToCatalogCategory: Record<ProductCategory, string[]> = {
  "fruits-vegetables": ["Fruits", "Vegetables"],
  "grains-cereals": ["Grains & Rice", "Flour & Baking"],
  "dairy-alternatives": ["Dairy & Eggs", "Beverages"],
  "meat-alternatives": ["Meat & Seafood", "Plant-based"],
  "pantry-staples": ["Oil & Ghee", "Spices & Seasonings", "Grains & Rice", "Flour & Baking", "Pulses & Lentils"],
  beverages: ["Beverages"],
  snacks: ["Snacks & Namkeen"],
  "personal-care": ["Personal Care"],
  household: ["Household"],
  supplements: ["Health & Wellness"],
}

const keywordToCatalogCategory: Record<string, string[]> = {
  fruit: ["Fruits"],
  fruits: ["Fruits"],
  vegetable: ["Vegetables"],
  vegetables: ["Vegetables"],
  snack: ["Snacks & Namkeen"],
  snacks: ["Snacks & Namkeen"],
  drink: ["Beverages"],
  drinks: ["Beverages"],
  beverage: ["Beverages"],
  beverages: ["Beverages"],
  rice: ["Grains & Rice"],
  grain: ["Grains & Rice"],
  grains: ["Grains & Rice"],
  flour: ["Flour & Baking"],
  spice: ["Spices & Seasonings"],
  spices: ["Spices & Seasonings"],
  dairy: ["Dairy & Eggs"],
  household: ["Household"],
  personal: ["Personal Care"],
}

const productIntentKeywords = [
  "organic",
  "product",
  "products",
  "buy",
  "shop",
  "grocery",
  "groceries",
  "recommend",
  "suggest",
  "budget",
  "cheap",
  "affordable",
]

const tokenize = (input: string) =>
  input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2)

export const shouldRecommendProducts = (userInput: string) => {
  const input = userInput.toLowerCase()
  return productIntentKeywords.some((keyword) => input.includes(keyword))
}

const getCatalogCategoriesFromInput = (userInput: string, preferences: UserPreferences) => {
  const inputCategories = new Set<string>()
  const tokens = tokenize(userInput)

  for (const token of tokens) {
    for (const category of keywordToCatalogCategory[token] || []) {
      inputCategories.add(category)
    }
  }

  if (inputCategories.size > 0) {
    return [...inputCategories]
  }

  const preferenceCategories = new Set<string>()
  for (const preferenceCategory of preferences.preferredCategories) {
    for (const category of preferredCategoryToCatalogCategory[preferenceCategory] || []) {
      preferenceCategories.add(category)
    }
  }

  return [...preferenceCategories]
}

const scoreProduct = (product: GroceryCatalogProduct, sustainabilityPriority: UserPreferences["sustainabilityPriority"]) => {
  const sustainabilityScore = mapGroceryProductToChatProduct(product).sustainabilityScore

  if (sustainabilityPriority === "high") {
    return sustainabilityScore * 2 - product.price / 100
  }

  if (sustainabilityPriority === "low") {
    return 10 - product.price / 50
  }

  return sustainabilityScore - product.price / 120
}

export const mapGroceryProductToChatProduct = (product: GroceryCatalogProduct): Product => {
  const normalizedCategory = product.category.toLowerCase()
  const category: ProductCategory = normalizedCategory.includes("fruit") || normalizedCategory.includes("vegetable")
    ? "fruits-vegetables"
    : normalizedCategory.includes("grain") || normalizedCategory.includes("flour")
      ? "grains-cereals"
      : normalizedCategory.includes("dairy")
        ? "dairy-alternatives"
        : normalizedCategory.includes("meat") || normalizedCategory.includes("plant")
          ? "meat-alternatives"
          : normalizedCategory.includes("beverage")
            ? "beverages"
            : normalizedCategory.includes("snack")
              ? "snacks"
              : normalizedCategory.includes("personal")
                ? "personal-care"
                : normalizedCategory.includes("household")
                  ? "household"
                  : normalizedCategory.includes("health")
                    ? "supplements"
                    : "pantry-staples"

  const sustainabilityScore = Math.max(
    1,
    Math.min(
      10,
      Math.round(
        (product.organic ? 4 : 1) +
          (product.locallySourced ? 2 : 0) +
          product.rating * 0.6 +
          (product.tags.includes("seasonal") ? 1 : 0),
      ),
    ),
  )

  return {
    id: product.id,
    name: product.name,
    description: `${product.description} (${product.unit})`,
    price: product.price,
    category,
    isOrganic: product.organic,
    sustainabilityScore,
    image: product.image,
    arModelUrl: `https://modelviewer.dev/shared-assets/models/Astronaut.glb?product=${encodeURIComponent(product.id)}`,
    inStock: product.inStock,
    certifications: [
      ...(product.organic ? ["Certified Organic"] : []),
      ...(product.locallySourced ? ["Locally Sourced"] : []),
      ...(product.rating >= 4.5 ? ["Top Rated"] : []),
    ],
    nutritionalInfo: product.nutritionInfo
      ? {
          calories: product.nutritionInfo.calories,
          protein: product.nutritionInfo.protein,
          carbs: product.nutritionInfo.carbs,
          fat: product.nutritionInfo.fat,
          fiber: product.nutritionInfo.fiber,
          sugar: 0,
          sodium: 0,
        }
      : undefined,
    supplier: product.locallySourced ? "Local Farm Network" : "Regional Distribution Partner",
    carbonFootprint: Number((product.locallySourced ? 1.1 : 2.3).toFixed(1)),
  }
}

export const getRecommendedProducts = (userInput: string, preferences: UserPreferences, limit = 4): Product[] => {
  const selectedCategories = getCatalogCategoriesFromInput(userInput, preferences)
  const [minBudget, maxBudget] = preferences.budgetRange
  const prefersOrganic = userInput.toLowerCase().includes("organic") || preferences.sustainabilityPriority === "high"
  const tokens = tokenize(userInput)

  const filtered = groceryProducts
    .filter((product) => product.inStock)
    .filter((product) => (prefersOrganic ? product.organic : true))
    .filter((product) =>
      selectedCategories.length > 0 ? selectedCategories.some((category) => category.toLowerCase() === product.category.toLowerCase()) : true,
    )
    .filter((product) => product.price >= minBudget && product.price <= maxBudget)
    .filter((product) => {
      const inputHasSearchIntent = tokens.some((token) => token.length > 3)
      if (!inputHasSearchIntent) {
        return true
      }

      const searchable = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase()
      return tokens.some((token) => searchable.includes(token))
    })
    .sort((a, b) => scoreProduct(b, preferences.sustainabilityPriority) - scoreProduct(a, preferences.sustainabilityPriority))

  const fallback = groceryProducts
    .filter((product) => product.inStock)
    .filter((product) => (prefersOrganic ? product.organic : true))
    .sort((a, b) => scoreProduct(b, preferences.sustainabilityPriority) - scoreProduct(a, preferences.sustainabilityPriority))

  const source = filtered.length > 0 ? filtered : fallback

  return source.slice(0, limit).map(mapGroceryProductToChatProduct)
}
