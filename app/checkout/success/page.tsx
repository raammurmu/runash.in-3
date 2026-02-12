import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download, Home, ShoppingBag } from "lucide-react"

export const metadata: Metadata = {
  title: "Order Success | RunAsh",
  description: "Your order has been successfully placed",
}

export default function OrderSuccessPage() {
  // In a real app, this would fetch the order details from an API
  const orderDetails = {
    orderNumber: "ORD-12346",
    date: "May 6, 2025",
    total: 249.98,
    paymentMethod: "Credit Card ending in 4242",
    shippingMethod: "Standard Shipping (3-5 business days)",
    estimatedDelivery: "May 10-12, 2025",
  }

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-center text-muted-foreground">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      <Card className="mb-8 w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Order #{orderDetails.orderNumber}</CardTitle>
          <CardDescription>Placed on {orderDetails.date}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Order Summary</h3>
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-medium">${orderDetails.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{orderDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Method</span>
                <span>{orderDetails.shippingMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span>{orderDetails.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
            <h3 className="mb-2 font-medium">What's Next?</h3>
            <p className="text-sm text-muted-foreground">
              You will receive an order confirmation email with details of your order. We'll notify you when your order
              has shipped.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/orders">
              <ShoppingBag className="mr-2 h-4 w-4" /> View Order
            </Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Download Receipt
          </Button>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 sm:w-auto" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Continue Shopping
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold">Need Help?</h2>
        <p className="mb-4 text-muted-foreground">
          If you have any questions about your order, please contact our customer support.
        </p>
        <Button variant="outline" asChild>
          <Link href="/support">Contact Support</Link>
        </Button>
      </div>
    </main>
  )
}
