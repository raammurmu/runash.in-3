import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  addToCart,
  createGroceryProduct,
  listGroceryCategories,
  listGroceryProducts,
  type GroceryProductRecord,
} from "@/lib/repositories/grocery"
import { mapGroceryProductToChatProduct } from "@/lib/chat-product-recommendations"
import { groceryProducts } from "@/lib/grocery-products"

const sortFieldMap = {
  name: "name",
  price: "price",
  rating: "average_rating",
} as const

const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  priceInr: z.number().nonnegative().nullable().optional(),
  category: z.string().min(1),
  subcategory: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  images: z.array(z.string().url()).optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  unit: z.string().min(1),
  minOrderQuantity: z.number().int().positive().optional(),
  maxOrderQuantity: z.number().int().positive().optional(),
  isOrganic: z.boolean().optional(),
  isFreshProduce: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

const legacyAddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().optional(),
})

function asClientProduct(product: GroceryProductRecord) {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: Number(product.price),
    priceINR: product.price_inr == null ? undefined : Number(product.price_inr),
    category: product.category,
    subcategory: product.subcategory ?? "",
    brand: product.brand ?? "",
    images: product.images ?? [],
    inStock: product.in_stock,
    stockQuantity: product.stock_quantity,
    unit: product.unit,
    minOrderQuantity: product.min_order_quantity,
    maxOrderQuantity: product.max_order_quantity,
    isOrganic: product.is_organic,
    isFreshProduce: product.is_fresh_produce,
    averageRating: Number(product.average_rating),
    totalReviews: product.total_reviews,
    tags: product.tags ?? [],
  }
}

function getUserContext(request: NextRequest) {
  const userId = request.headers.get("x-user-id")
  const role = (request.headers.get("x-user-role") ?? "").toLowerCase()
  return { userId, role }
}

function hasProductWriteAccess(role: string) {
  return role === "admin" || role === "seller"
}

function getCatalogFallbackProducts(params: {
  category: string | null
  search: string | null
  isOrganic: boolean
  isFreshProduce: boolean
  minPrice?: number
  maxPrice?: number
  sortBy: "name" | "price" | "average_rating"
  sortOrder: "asc" | "desc"
  limit: number
  offset: number
}) {
  let filtered = [...groceryProducts]

  if (params.category && params.category !== "all") {
    filtered = filtered.filter((product) => product.category.toLowerCase() === params.category.toLowerCase())
  }

  if (params.search) {
    const term = params.search.toLowerCase()
    filtered = filtered.filter((product) => {
      const tags = Array.isArray(product.tags) ? product.tags : []
      return (
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        tags.some((tag) => tag.toLowerCase().includes(term))
      )
    })
  }

  if (params.isOrganic) {
    filtered = filtered.filter((product) => product.organic)
  }

  if (params.isFreshProduce) {
    filtered = filtered.filter((product) => product.locallySourced)
  }

  if (typeof params.minPrice === "number") {
    const minimum = params.minPrice
    filtered = filtered.filter((product) => product.price >= minimum)
  }

  if (typeof params.maxPrice === "number") {
    const maximum = params.maxPrice
    filtered = filtered.filter((product) => product.price <= maximum)
  }

  filtered.sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    if (params.sortBy === "price") {
      aValue = a.price
      bValue = b.price
    } else if (params.sortBy === "average_rating") {
      aValue = a.rating
      bValue = b.rating
    } else {
      aValue = a.name.toLowerCase()
      bValue = b.name.toLowerCase()
    }

    if (params.sortOrder === "desc") {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }

    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
  })

  const paginated = filtered.slice(params.offset, params.offset + params.limit)

  return {
    products: paginated.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      priceINR: undefined,
      category: product.category,
      subcategory: product.subcategory,
      brand: "",
      images: [product.image],
      inStock: product.inStock,
      stockQuantity: product.inStock ? 100 : 0,
      unit: product.unit,
      minOrderQuantity: 1,
      maxOrderQuantity: 10,
      isOrganic: product.organic,
      isFreshProduce: product.locallySourced,
      averageRating: product.rating,
      totalReviews: product.reviewCount,
      tags: product.tags,
    })),
    totalProducts: filtered.length,
    categories: [...new Set(groceryProducts.map((product) => product.category))],
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const organic = searchParams.get("organic")
    const locallySourced = searchParams.get("locallySourced")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "name"
    const format = searchParams.get("format")
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)

    const normalizedOrganic = searchParams.get("isOrganic") ?? organic
    const normalizedFreshProduce = searchParams.get("isFreshProduce") ?? locallySourced
    const normalizedSortBy = sortBy in sortFieldMap ? sortFieldMap[sortBy as keyof typeof sortFieldMap] : sortFieldMap.name
    const normalizedSortOrder = sortOrder === "desc" ? "desc" : "asc"
    const safePage = Number.isFinite(page) && page > 0 ? page : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20

    let normalizedProducts: ReturnType<typeof asClientProduct>[] = []
    let totalProducts = 0
    let categories: string[] = []

    try {
      const result = await listGroceryProducts({
        category,
        search,
        isOrganic: normalizedOrganic === "true",
        isFreshProduce: normalizedFreshProduce === "true",
        minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
        sortBy: normalizedSortBy,
        sortOrder: normalizedSortOrder,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
      })

      totalProducts = result.totalProducts
      normalizedProducts = result.products.map(asClientProduct)
      categories = (await listGroceryCategories()).map((row) => row.category)
    } catch {
      const fallback = getCatalogFallbackProducts({
        category,
        search,
        isOrganic: normalizedOrganic === "true",
        isFreshProduce: normalizedFreshProduce === "true",
        minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
        sortBy: normalizedSortBy,
        sortOrder: normalizedSortOrder,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
      })
      normalizedProducts = fallback.products
      totalProducts = fallback.totalProducts
      categories = fallback.categories
    }

    const responseProducts =
      format === "chat" ? normalizedProducts.map((product) => mapGroceryProductToChatProduct(product)) : normalizedProducts

    return NextResponse.json({
      products: responseProducts,
      totalProducts,
      totalPages: Math.ceil(totalProducts / safeLimit),
      currentPage: safePage,
      categories,
      filters: {
        category,
        search,
        organic: normalizedOrganic,
        isOrganic: normalizedOrganic,
        locallySourced: normalizedFreshProduce,
        isFreshProduce: normalizedFreshProduce,
        minPrice,
        maxPrice,
        sortBy: normalizedSortBy,
        sortOrder: normalizedSortOrder,
      },
    })
  } catch (error) {
    console.error("grocery_products_get_failed")
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const legacyAttempt = legacyAddToCartSchema.safeParse(body)
    if (legacyAttempt.success) {
      const userId = request.headers.get("x-user-id")
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const added = await addToCart(userId, legacyAttempt.data.productId, legacyAttempt.data.quantity ?? 1)
      if (!added) {
        return NextResponse.json({ error: "Unable to add product to cart" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: "Product added to cart",
        product: {
          id: added.product_id,
          name: added.product_name,
          price: Number(added.product_price),
          category: added.product_category,
          quantity: added.quantity,
        },
      })
    }

    const parsed = productCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { userId, role } = getUserContext(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasProductWriteAccess(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const created = await createGroceryProduct(parsed.data)
    return NextResponse.json(asClientProduct(created), { status: 201 })
  } catch (error) {
    console.error("grocery_products_post_failed")
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
