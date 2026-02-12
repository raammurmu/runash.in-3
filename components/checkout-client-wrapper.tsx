"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CheckoutForm from "@/components/checkout-form"
import OrderSummary from "@/components/order-summary"
import { useCart } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CheckoutClientWrapper() {
  const { items } = useCart()
  const router = useRouter()

  // Redirect to cart if there are no items
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  // Don't render anything if there are no items
  if (items.length === 0) {
    return null
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping & Payment</CardTitle>
            <CardDescription>Enter your details to complete your order</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutForm />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your items</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderSummary />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
