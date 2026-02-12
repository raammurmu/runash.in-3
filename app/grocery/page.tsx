"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
 
import { Search, Filter, Leaf, Truck, Clock, MapPin, PlayCircle, Video, History, Globe } from "lucide-react"


import { CurrencyProvider, useCurrency } from "@/contexts/currency-context"
import CurrencySelector from "@/components/grocery/currency-selector"
import ProductGrid from "@/components/grocery/product-grid"
import CategorySidebar from "@/components/grocery/category-sidebar"
import ProductFilters from "@/components/grocery/product-filters"
import FeaturedProducts from "@/components/grocery/featured-products"
import CartDrawer from "@/components/cart/cart-drawer"
import type { GroceryProduct, GroceryCategory, GroceryFilter } from "@/types/grocery-store"
import FloatingLiveShoppingButton from "@/components/grocery/floating-live-shopping-button"
import { getActiveLiveStreams } from "@/lib/live-streaming"
import { getFeaturedVods } from "@/lib/video-on-demand"
import { getRecentRecordings } from "@/lib/previous-live-recording"
 
import { PWASupport } from "@/components/pwa/pwa-support"



type SortBy = "name" | "price" | "rating"
type SortOrder = "asc" | "desc"

interface ApiGroceryProduct {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  unit: string
  image?: string
  inStock: boolean
  organic: boolean
  locallySourced: boolean
  tags: string[]
  rating: number
  reviewCount: number
  discount?: number
}

const categoryToApiValue: Record<GroceryCategory, string> = {
  fruits: "fruits",
  vegetables: "vegetables",
  "grains-cereals": "grains & cereals",
  "dairy-alternatives": "dairy alternatives",
  "meat-alternatives": "meat alternatives",
  "pantry-staples": "pantry staples",
  beverages: "beverages",
  snacks: "snacks",
  "spices-herbs": "spices & herbs",
  "oils-vinegars": "oils & vinegars",
  "nuts-seeds": "nuts & seeds",
  superfoods: "superfoods",
}

function mapApiCategoryToUiCategory(category: string): GroceryCategory {
  const normalized = category.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-")
  switch (normalized) {
    case "fruits":
      return "fruits"
    case "vegetables":
      return "vegetables"
    case "grains-cereals":
      return "grains-cereals"
    case "dairy-alternatives":
      return "dairy-alternatives"
    case "meat-alternatives":
      return "meat-alternatives"
    case "pantry-staples":
      return "pantry-staples"
    case "beverages":
      return "beverages"
    case "snacks":
      return "snacks"
    case "spices-herbs":
      return "spices-herbs"
    case "oils-vinegars":
      return "oils-vinegars"
    case "nuts-seeds":
      return "nuts-seeds"
    case "superfoods":
      return "superfoods"
    default:
      return "pantry-staples"
  }
}

function adaptApiProductToGroceryProduct(product: ApiGroceryProduct): GroceryProduct {
  const isOnSale = Boolean(product.discount)
  const salePrice = isOnSale ? Number((product.price * (1 - (product.discount || 0) / 100)).toFixed(2)) : undefined

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: mapApiCategoryToUiCategory(product.category),
    subcategory: product.subcategory,
    brand: "RunAsh Marketplace",
    images: [product.image || "/placeholder.svg?height=300&width=300"],
    inStock: product.inStock,
    stockQuantity: product.inStock ? 100 : 0,
    unit: product.unit,
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    isOrganic: product.organic,
    isFreshProduce: product.locallySourced,
    origin: product.locallySourced ? "Local Farm Network" : "Regional Supplier",
    certifications: product.organic ? ["Organic"] : ["Quality Checked"],
    sustainabilityScore: product.locallySourced ? 9 : 7,
    carbonFootprint: product.locallySourced ? 1.1 : 2.4,
    farmInfo: product.locallySourced
      ? {
          farmName: "RunAsh Partner Farm",
          location: "Nearby",
          farmerName: "Verified Producer",
          farmingMethod: product.organic ? "Organic" : "Standard",
          certifications: product.organic ? ["Organic"] : ["Quality Checked"],
          distance: 40,
        }
      : undefined,
    reviews: [],
    averageRating: product.rating,
    totalReviews: product.reviewCount,
    tags: product.tags,
    isOnSale,
    salePrice,
  }
}

function GroceryStoreContent() {
  const { formatPrice } = useCurrency()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState<GroceryCategory | "all">(
    (searchParams.get("category") as GroceryCategory | "all") || "all",
  )
  const [filters, setFilters] = useState<Partial<GroceryFilter>>(() => {
    const minPrice = Number(searchParams.get("minPrice") || "0")
    const maxPrice = Number(searchParams.get("maxPrice") || "200")
    return {
      isOrganic: searchParams.get("organic") === "true",
      isFreshProduce: searchParams.get("locallySourced") === "true",
      priceRange: [minPrice, maxPrice],
    }
  })
  const [sortBy, setSortBy] = useState<SortBy>((searchParams.get("sortBy") as SortBy) || "name")
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get("sortOrder") as SortOrder) || "asc")
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get("page") || "1")))
  const [limit, setLimit] = useState(Math.max(1, Number(searchParams.get("limit") || "12")))
  const [products, setProducts] = useState<GroceryProduct[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [locale, setLocale] = useState<"en" | "hi">("en")

  useEffect(() => {
    const params = new URLSearchParams()

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory)
    }
    if (searchQuery) {
      params.set("search", searchQuery)
    }
    params.set("organic", String(Boolean(filters.isOrganic)))
    params.set("locallySourced", String(Boolean(filters.isFreshProduce)))
    params.set("minPrice", String(filters.priceRange?.[0] ?? 0))
    params.set("maxPrice", String(filters.priceRange?.[1] ?? 200))
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)
    params.set("page", String(page))
    params.set("limit", String(limit))

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiParams = new URLSearchParams(params)
        if (selectedCategory !== "all") {
          apiParams.set("category", categoryToApiValue[selectedCategory])
        }

        const response = await fetch(`/api/grocery/products?${apiParams.toString()}`)
        if (!response.ok) {
          throw new Error(`Failed to load products (${response.status})`)
        }

        const data = await response.json()
        const adaptedProducts = (data.products || []).map((product: ApiGroceryProduct) =>
          adaptApiProductToGroceryProduct(product),
        )
        setProducts(adaptedProducts)
        setTotalProducts(data.totalProducts || 0)
        setTotalPages(data.totalPages || 1)
      } catch (fetchError) {
        setProducts([])
        setTotalProducts(0)
        setTotalPages(1)
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load grocery products.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters.isFreshProduce, filters.isOrganic, filters.priceRange, limit, page, pathname, router, searchQuery, selectedCategory, sortBy, sortOrder])

  const hasNoResults = !loading && !error && products.length === 0

  const activeStreams = getActiveLiveStreams()
  const featuredVods = getFeaturedVods(3)
  const recentRecordings = getRecentRecordings(3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 p-2">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
                    RunAsh
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400"Store</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-2 rounded-md border px-2 py-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <select
                  aria-label="Language"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as "en" | "hi")}
                  className="bg-transparent text-sm outline-none"
                >
                  <option value="en">EN</option>
                  <option value="hi">हिं</option>
                </select>
              </div>
              <CurrencySelector />
              <CartDrawer />
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for organic products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm font-medium">Free Delivery</div>
              <div className="text-xs text-muted-foreground">Orders over {formatPrice(50)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium">Same Day</div>
              <div className="text-xs text-muted-foreground">Delivery available</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm font-medium">100% Organic</div>
              <div className="text-xs text-muted-foreground">Certified products</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-sm font-medium">Local Farms</div>
              <div className="text-xs text-muted-foreground">Direct sourcing</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-6">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategorySelect={(category) => {
                setSelectedCategory(category)
                setPage(1)
              }}
            />

            {showFilters && (
              <ProductFilters
                filters={filters}
                onFiltersChange={(nextFilters) => {
                  setFilters(nextFilters)
                  setPage(1)
                }}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="products">All Products</TabsTrigger>
                <TabsTrigger value="deals">Deals</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
              </TabsList>

              <TabsContent value="featured">
                <FeaturedProducts products={products.slice(0, 6)} />
              </TabsContent>

              <TabsContent value="products">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {selectedCategory === "all" ? "All Products" : `${selectedCategory} Products`}
                    </h2>
                    <div className="text-sm text-muted-foreground">{totalProducts} products found</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="sortBy" className="text-sm text-muted-foreground">
                        Sort by
                      </label>
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value as SortBy)
                          setPage(1)
                        }}
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                      >
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="sortOrder" className="text-sm text-muted-foreground">
                        Order
                      </label>
                      <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={(e) => {
                          setSortOrder(e.target.value as SortOrder)
                          setPage(1)
                        }}
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="locally-sourced"
                        checked={Boolean(filters.isFreshProduce)}
                        onCheckedChange={(checked) => {
                          setFilters((prev) => ({ ...prev, isFreshProduce: Boolean(checked) }))
                          setPage(1)
                        }}
                      />
                      <label htmlFor="locally-sourced" className="text-sm text-muted-foreground">
                        Locally sourced only
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="limit" className="text-sm text-muted-foreground">
                        Per page
                      </label>
                      <select
                        id="limit"
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value))
                          setPage(1)
                        }}
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                      >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={36}>36</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <Card>
                      <CardContent className="p-6 text-sm text-red-600">
                        {error}. Please try again.
                      </CardContent>
                    </Card>
                  )}

                  {hasNoResults && (
                    <Card>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        No products found for your current filters.
                      </CardContent>
                    </Card>
                  )}

                  {!error && !hasNoResults && <ProductGrid products={products} loading={loading} locale={locale} />}

                  {!loading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-between border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={page >= totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="deals">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Special Deals</h2>
                  <ProductGrid products={products.filter((p) => p.isOnSale)} loading={loading} locale={locale} />
                </div>
              </TabsContent>

              <TabsContent value="live">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Live Shopping & Recordings</h2>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <PlayCircle className="h-4 w-4 text-emerald-600" /> Live now
                        </div>
                        {activeStreams.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No active stream right now.</p>
                        ) : (
                          activeStreams.map((stream) => (
                            <div key={stream.id} className="rounded-md border p-3">
                              <div className="font-medium text-sm">{stream.title}</div>
                              <p className="text-xs text-muted-foreground">{stream.hostName} • {stream.viewerCount.toLocaleString()} viewers</p>
                            </div>
                          ))
                        )}
                        <Button variant="outline" onClick={() => router.push("/grocery/live")}>Watch live</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Video className="h-4 w-4 text-purple-600" /> Video on demand
                        </div>
                        {featuredVods.map((vod) => (
                          <div key={vod.id} className="rounded-md border p-3">
                            <div className="font-medium text-sm">{vod.title}</div>
                            <p className="text-xs text-muted-foreground">{Math.ceil(vod.durationSeconds / 60)} min • {vod.views.toLocaleString()} views</p>
                          </div>
                        ))}
                        <Button variant="outline" onClick={() => router.push("/grocery/live/recordings")}>Open VOD library</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <History className="h-4 w-4 text-orange-600" /> Previous live recordings
                        </div>
                        {recentRecordings.map((recording) => (
                          <div key={recording.id} className="rounded-md border p-3">
                            <div className="font-medium text-sm">{recording.title}</div>
                            <p className="text-xs text-muted-foreground">{recording.totalPurchases} purchases • {recording.clipCount} clips</p>
                          </div>
                        ))}
                        <Button variant="outline" onClick={() => router.push("/recordings")}>Manage recordings</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>


              <TabsContent value="live">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Live Shopping & Recordings</h2>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <PlayCircle className="h-4 w-4 text-emerald-600" /> Live now
                        </div>
                        {activeStreams.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No active stream right now.</p>
                        ) : (
                          activeStreams.map((stream) => (
                            <div key={stream.id} className="rounded-md border p-3">
                              <div className="font-medium text-sm">{stream.title}</div>
                              <p className="text-xs text-muted-foreground">{stream.hostName} • {stream.viewerCount.toLocaleString()} viewers</p>
                            </div>
                          ))
                        )}
                        <Button variant="outline" onClick={() => router.push("/grocery/live")}>Watch live</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Video className="h-4 w-4 text-purple-600" /> Video on demand
                        </div>
                        {featuredVods.map((vod) => (
                          <div key={vod.id} className="rounded-md border p-3">
                            <div className="font-medium text-sm">{vod.title}</div>
                            <p className="text-xs text-muted-foreground">{Math.ceil(vod.durationSeconds / 60)} min • {vod.views.toLocaleString()} views</p>
                          </div>
                        ))}
                        <Button variant="outline" onClick={() => router.push("/grocery/live/recordings")}>Open VOD library</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <History className="h-4 w-4 text-orange-600" /> Previous live recordings
                        </div>
                        {recentRecordings.map((recording) => (
                          <div key={recording.id} className="rounded-md border p-3">
                            <div className="font-medium text-sm">{recording.title}</div>
                            <p className="text-xs text-muted-foreground">{recording.totalPurchases} purchases • {recording.clipCount} clips</p>
                          </div>
                        ))}
                        <Button variant="outline" onClick={() => router.push("/recordings")}>Manage recordings</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>


            </Tabs>
          </div>
        </div>
      </div>
      {/* Floating Live Shopping Button */}
      <FloatingLiveShoppingButton />
      <PWASupport />
    </div>
  )
}

export default function GroceryStorePage() {
  return (
    <CurrencyProvider>
      <GroceryStoreContent />
    </CurrencyProvider>
  )
}
