"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Leaf, ShoppingCart, Heart, Info } from "lucide-react"
import type { Product } from "@/types/runash-chat"
import { useCart } from "@/contexts/cart-context"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product, 1)
    // Show success toast
    console.log("Added to cart:", product.name)
  }

  const handleViewDetails = () => {
    // View product details
    console.log("View details:", product.name)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={320}
          height={128}
          sizes="(max-width: 768px) 100vw, 320px"
          className="h-32 w-full object-cover"
        />
        {product.isOrganic && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">
            <Leaf className="h-3 w-3 mr-1" />
            Organic
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1">
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
          <span className="text-xs font-medium">{product.sustainabilityScore}/10</span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm">{product.name}</h4>
          <span className="text-lg font-bold text-green-600">${product.price}</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {product.certifications.map((cert) => (
            <Badge key={cert} variant="outline" className="text-xs">
              {cert}
            </Badge>
          ))}
        </div>

        {product.carbonFootprint && (
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
            <Leaf className="h-3 w-3 mr-1 text-green-500" />
            Carbon footprint: {product.carbonFootprint}kg CO₂
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewDetails} aria-label={`View details for ${product.name}`}>
            <Info className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" aria-label={`Add ${product.name} to favorites`}>
            <Heart className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
