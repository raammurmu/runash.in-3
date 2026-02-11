import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CheckoutClientWrapper from "@/components/checkout-client-wrapper"

export const metadata: Metadata = {
  title: "Checkout | RunAsh",
  description: "Complete your purchase",
}

export default function CheckoutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cart" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
      </div>

      <CheckoutClientWrapper />
    </main>
  )
}
