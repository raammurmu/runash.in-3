import type { Product, ProductCategory, UserPreferences } from "../types/runash-chat"

export const PRODUCT_RECOMMENDATIONS: Product[] = [
  {
    id: "product-1",
    name: "Organic Quinoa",
    description: "Protein-rich whole grain for bowls, salads, and meal prep.",
    price: 12.99,
    category: "grains-cereals",
    isOrganic: true,
    sustainabilityScore: 9,
    image: "https://picsum.photos/seed/product-1/640/640",
    imageHd: "https://picsum.photos/seed/product-1-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/product-1-thumb/320/320",
    imageAlt: "Organic Quinoa",
    inStock: true,
    certifications: ["USDA Organic", "Fair Trade"],
    carbonFootprint: 2.1,
  },
  {
    id: "product-2",
    name: "Seasonal Mixed Vegetables Box",
    description: "Local seasonal produce box sourced from nearby farms.",
    price: 24.5,
    category: "fruits-vegetables",
    isOrganic: true,
    sustainabilityScore: 10,
    image: "https://picsum.photos/seed/product-2/640/640",
    imageHd: "https://picsum.photos/seed/product-2-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/product-2-thumb/320/320",
    imageAlt: "Seasonal Mixed Vegetables Box",
    inStock: true,
    certifications: ["USDA Organic"],
    carbonFootprint: 1.3,
  },
  {
    id: "product-3",
    name: "Oat Milk Unsweetened",
    description: "Dairy-free milk alternative with a low water footprint.",
    price: 4.99,
    category: "dairy-alternatives",
    isOrganic: true,
    sustainabilityScore: 8,
    image: "https://picsum.photos/seed/product-3/640/640",
    imageHd: "https://picsum.photos/seed/product-3-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/product-3-thumb/320/320",
    imageAlt: "Oat Milk Unsweetened",
    inStock: true,
    certifications: ["USDA Organic", "Non-GMO Project"],
    carbonFootprint: 1.5,
  },
  {
    id: "product-4",
    name: "Chickpea Pasta",
    description: "High-protein, plant-based pasta for fast weeknight meals.",
    price: 6.49,
    category: "pantry-staples",
    isOrganic: true,
    sustainabilityScore: 8,
    image: "https://picsum.photos/seed/product-4/640/640",
    imageHd: "https://picsum.photos/seed/product-4-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/product-4-thumb/320/320",
    imageAlt: "Chickpea Pasta",
    inStock: true,
    certifications: ["USDA Organic"],
    carbonFootprint: 1.8,
  },
  {
    id: "product-5",
    name: "Natural Citrus Cleaner",
    description: "Plant-based household cleaner in a refill-ready bottle.",
    price: 7.99,
    category: "household",
    isOrganic: false,
    sustainabilityScore: 9,
    image: "https://picsum.photos/seed/product-5/640/640",
    imageHd: "https://picsum.photos/seed/product-5-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/product-5-thumb/320/320",
    imageAlt: "Natural Citrus Cleaner",
    inStock: true,
    certifications: ["Cruelty Free"],
    carbonFootprint: 0.9,
  },
  {
    id: "product-6",
    name: "Trail Mix with Nuts & Seeds",
    description: "Energy-dense snack blend with minimal packaging.",
    price: 8.49,
    category: "snacks",
    isOrganic: true,
    sustainabilityScore: 7,
    image: "https://picsum.photos/seed/product-6/640/640",
    imageHd: "https://picsum.photos/seed/product-6-hd/1200/1200",
    imageThumb: "https://picsum.photos/seed/product-6-thumb/320/320",
    imageAlt: "Trail Mix with Nuts & Seeds",
    inStock: true,
    certifications: ["USDA Organic"],
    carbonFootprint: 2.4,
  },
]

const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  "fruits-vegetables": ["produce", "vegetable", "fruit", "fresh"],
  "grains-cereals": ["grain", "cereal", "quinoa", "rice", "oats"],
  "dairy-alternatives": ["dairy", "milk", "vegan milk"],
  "meat-alternatives": ["tofu", "tempeh", "meat alternative", "protein"],
  "pantry-staples": ["pantry", "pasta", "beans", "lentils"],
  beverages: ["drink", "juice", "beverage", "tea", "coffee"],
  snacks: ["snack", "chips", "trail mix", "bar"],
  "personal-care": ["soap", "shampoo", "care"],
  household: ["cleaner", "detergent", "household"],
  supplements: ["vitamin", "supplement", "protein powder"],
}

export const getProductRecommendations = (input: string, prefs?: UserPreferences): Product[] => {
  const query = input.toLowerCase()

  const scored = PRODUCT_RECOMMENDATIONS.map((product) => {
    let score = product.sustainabilityScore

    if (query.includes(product.name.toLowerCase())) score += 6
    if (query.includes(product.category)) score += 4

    for (const keyword of CATEGORY_KEYWORDS[product.category]) {
      if (query.includes(keyword)) {
        score += 2
        break
      }
    }

    if (query.includes("organic") && product.isOrganic) score += 3

    if (prefs) {
      const [minBudget, maxBudget] = prefs.budgetRange
      if (product.price >= minBudget && product.price <= maxBudget) score += 3

      if (prefs.preferredCategories.includes(product.category)) score += 4

      if (prefs.sustainabilityPriority === "high") {
        score += product.sustainabilityScore >= 8 ? 3 : -1
      }
    }

    return { product, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)
    .slice(0, 5)
}
