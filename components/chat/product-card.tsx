"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, Leaf, ShoppingCart, Heart, Info, ScanSearch } from "lucide-react"
import type { Product } from "@/types/runash-chat"
import { useCart } from "@/contexts/cart-context"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [arOpen, setArOpen] = useState(false)

  const handleAddToCart = () => {
    addToCart(product, 1)
    console.log("Added to cart:", product.name)
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="h-32 w-full object-cover" />
        {product.isOrganic && (
          <Badge className="absolute left-2 top-2 bg-green-600 text-white">
            <Leaf className="mr-1 h-3 w-3" />
            Organic
          </Badge>
        )}
        <div className="absolute right-2 top-2 flex items-center space-x-1 rounded-full bg-white/90 px-2 py-1">
          <Star className="h-3 w-3 fill-current text-yellow-500" />
          <span className="text-xs font-medium">{product.sustainabilityScore}/10</span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium">{product.name}</h4>
          <span className="text-lg font-bold text-green-600">${product.price}</span>
        </div>
        <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{product.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-3 flex flex-wrap gap-1">
          {product.certifications.map((cert) => (
            <Badge key={cert} variant="outline" className="text-xs">
              {cert}
            </Badge>
          ))}
        </div>

        {product.carbonFootprint && (
          <div className="mb-3 flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Leaf className="mr-1 h-3 w-3 text-green-500" />
            Carbon footprint: {product.carbonFootprint}kg CO₂
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-500 text-white hover:from-orange-700 hover:to-yellow-600"
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>

          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" aria-label="View product details">
                <Info className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
                <DialogDescription>Detailed product view with certifications and sustainability details.</DialogDescription>
              </DialogHeader>
              <img src={product.imageHd ?? product.image ?? "/placeholder.svg"} alt={product.name} className="h-56 w-full rounded-md object-cover" />
              <p className="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium">Category</div>
                  <div className="text-gray-500">{product.category}</div>
                </div>
                <div>
                  <div className="font-medium">Supplier</div>
                  <div className="text-gray-500">{product.supplier ?? "RunAsh Marketplace"}</div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={arOpen} onOpenChange={setArOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Open AR product view">
                <ScanSearch className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AR Product View</DialogTitle>
                <DialogDescription>Preview the product in augmented reality on supported devices.</DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-md border bg-muted">
                {product.arModelUrl ? (
                  <iframe
                    title={`${product.name} AR preview`}
                    src={product.arModelUrl}
                    className="h-72 w-full"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                    No AR model attached yet. Add product.arModelUrl to enable 3D preview.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm">
            <Heart className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
