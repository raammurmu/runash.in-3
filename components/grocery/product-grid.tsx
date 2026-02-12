"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ShoppingCart,
  Heart,
  Star,
  Leaf,
  Clock,
  MapPin,
  Zap,
  Eye,
  Plus,
  Minus,
  X,
  ZoomIn,
  Box,
  MessageCircle,
} from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { useCart } from "@/contexts/cart-context"
import type { GroceryProduct } from "@/types/grocery-store"

interface ProductGridProps {
  products: GroceryProduct[]
  loading?: boolean
  locale?: "en" | "hi"
}

const localizedText = {
  en: {
    organic: "Organic",
    sale: "Sale",
    fresh: "Fresh",
    outOfStock: "Out of Stock",
    reviews: "reviews",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    ecoScore: "Eco Score",
    viewMore: "View more",
    quickView: "Quick view",
    arView: "AR View",
    close: "Close",
    zoom: "Zoom",
    features: "Features",
    like: "Like",
  },
  hi: {
    organic: "ऑर्गेनिक",
    sale: "ऑफर",
    fresh: "ताज़ा",
    outOfStock: "स्टॉक समाप्त",
    reviews: "रिव्यू",
    quantity: "मात्रा",
    addToCart: "कार्ट में जोड़ें",
    ecoScore: "इको स्कोर",
    viewMore: "और देखें",
    quickView: "क्विक व्यू",
    arView: "AR व्यू",
    close: "बंद करें",
    zoom: "ज़ूम",
    features: "फीचर्स",
    like: "पसंद",
  },
}

export default function ProductGrid({ products, loading, locale = "en" }: ProductGridProps) {
  const { currency, formatPrice, convertPrice } = useCurrency()
  const { addToCart } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({})
  const [selectedProduct, setSelectedProduct] = useState<GroceryProduct | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const t = localizedText[locale]

  const productFeatures = useMemo(
    () => (product: GroceryProduct) => [
      product.isOrganic ? t.organic : "Quality Checked",
      product.isFreshProduce ? t.fresh : "Long Shelf Life",
      `${product.sustainabilityScore}/10 ${t.ecoScore}`,
    ],
    [t.ecoScore, t.fresh, t.organic],
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getQuantity = (productId: string) => quantities[productId] || 1

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const currentQty = getQuantity(productId)
    const newQty = Math.max(product.minOrderQuantity, Math.min(product.maxOrderQuantity, currentQty + delta))

    setQuantities((prev) => ({ ...prev, [productId]: newQty }))
  }

  const handleAddToCart = (product: GroceryProduct) => {
    const quantity = getQuantity(product.id)

    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: currency === "INR" && product.priceINR ? product.priceINR : convertPrice(product.price),
      category: product.category,
      isOrganic: product.isOrganic,
      sustainabilityScore: product.sustainabilityScore,
      image: product.images[0],
      inStock: product.inStock,
      certifications: product.certifications,
      carbonFootprint: product.carbonFootprint,
      isLocal: product.farmInfo ? product.farmInfo.distance < 100 : false,
    }

    addToCart(cartProduct, quantity)
  }

  const getDisplayPrice = (product: GroceryProduct) => {
    if (currency === "INR" && product.priceINR) {
      return formatPrice(product.priceINR)
    }
    return formatPrice(convertPrice(product.price))
  }

  const getSalePrice = (product: GroceryProduct) => {
    if (!product.isOnSale || !product.salePrice) return null

    if (currency === "INR" && product.priceINR) {
      const saleRatio = product.salePrice / product.price
      const inrSalePrice = product.priceINR * saleRatio
      return formatPrice(inrSalePrice)
    }
    return formatPrice(convertPrice(product.salePrice))
  }

  const toggleLiked = (productId: string) => {
    setLikedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md"
          >
            <div className="relative">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isOrganic && (
                  <Badge className="bg-green-600 text-white">
                    <Leaf className="h-3 w-3 mr-1" />
                    {t.organic}
                  </Badge>
                )}
                {product.isOnSale && (
                  <Badge className="bg-red-600 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    {t.sale}
                  </Badge>
                )}
                {product.isFreshProduce && (
                  <Badge className="bg-blue-600 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {t.fresh}
                  </Badge>
                )}
              </div>

              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleLiked(product.id)}
                  aria-label={t.like}
                >
                  <Heart className={`h-4 w-4 ${likedProducts[product.id] ? "fill-current text-red-500" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setSelectedProduct(product)
                    setZoomLevel(1)
                  }}
                  aria-label={t.quickView}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    {t.outOfStock}
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium ml-1">{product.averageRating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({product.totalReviews} {t.reviews})</span>
                </div>

                {product.farmInfo && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{product.farmInfo.location}</span>
                    <span className="ml-2">({product.farmInfo.distance}km)</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {productFeatures(product).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-[10px]">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {product.isOnSale && product.salePrice ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">{getSalePrice(product)}</span>
                        <span className="text-sm text-muted-foreground line-through">{getDisplayPrice(product)}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-green-600">{getDisplayPrice(product)}</span>
                    )}
                    <div className="text-xs text-muted-foreground">per {product.unit}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">{t.ecoScore}</div>
                    <div className="text-sm font-bold text-green-600">{product.sustainabilityScore}/10</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-8 flex-1"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product)
                      setZoomLevel(1)
                    }}
                  >
                    <ZoomIn className="mr-1 h-3 w-3" /> {t.viewMore}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8"
                    size="sm"
                    onClick={() => window.open(`https://modelviewer.dev/shared-assets/models/Astronaut.glb?product=${encodeURIComponent(product.id)}`, "_blank")}
                  >
                    <Box className="h-3 w-3" />
                  </Button>
                </div>

                {product.inStock && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t.quantity}:</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(product.id, -1)}
                          disabled={getQuantity(product.id) <= product.minOrderQuantity}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{getQuantity(product.id)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(product.id, 1)}
                          disabled={getQuantity(product.id) >= product.maxOrderQuantity}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t.addToCart}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4">
          <div className="mx-auto max-w-4xl rounded-lg bg-background p-4 shadow-xl md:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} aria-label={t.close}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-md border bg-muted">
                <img
                  src={selectedProduct.images[0] || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  className="h-80 w-full object-cover"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="zoom" className="text-sm font-medium">
                    {t.zoom}: {Math.round(zoomLevel * 100)}%
                  </label>
                  <input
                    id="zoom"
                    type="range"
                    min={1}
                    max={2}
                    step={0.1}
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">{t.features}</p>
                  <div className="flex flex-wrap gap-2">
                    {productFeatures(selectedProduct).map((feature) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    {selectedProduct.totalReviews} {t.reviews}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg rating {selectedProduct.averageRating} • {selectedProduct.tags.slice(0, 3).join(", ")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `https://modelviewer.dev/shared-assets/models/Astronaut.glb?product=${encodeURIComponent(selectedProduct.id)}`,
                        "_blank",
                      )
                    }
                  >
                    <Box className="mr-2 h-4 w-4" /> {t.arView}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-500 text-white"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> {t.addToCart}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
