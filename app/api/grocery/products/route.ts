import { type NextRequest, NextResponse } from "next/server"
import { groceryProducts } from "@/lib/grocery-products"
import { mapGroceryProductToChatProduct } from "@/lib/chat-product-recommendations"

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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let filteredProducts = [...groceryProducts]

    // Apply filters
    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    if (organic === "true") {
      filteredProducts = filteredProducts.filter((product) => product.organic)
    }

    if (locallySourced === "true") {
      filteredProducts = filteredProducts.filter((product) => product.locallySourced)
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter((product) => product.price >= Number.parseInt(minPrice))
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter((product) => product.price <= Number.parseInt(maxPrice))
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]

      if (sortBy === "price") {
        aValue = a.price
        bValue = b.price
      } else if (sortBy === "rating") {
        aValue = a.rating
        bValue = b.rating
      } else if (sortBy === "name") {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    // Get categories for filter options
    const categories = [...new Set(groceryProducts.map((product) => product.category))]

    const products = format === "chat" ? paginatedProducts.map(mapGroceryProductToChatProduct) : paginatedProducts

    return NextResponse.json({
      products,
      totalProducts: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
      currentPage: page,
      categories,
      filters: {
        category,
        search,
        organic,
        locallySourced,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity = 1 } = body

    const product = groceryProducts.find((p) => p.id === productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (!product.inStock) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 400 })
    }

    // In a real app, you would add to cart in database
    // For now, just return success with product details
    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      product: {
        ...product,
        quantity,
      },
    })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add product to cart" }, { status: 500 })
  }
}
