"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import { CreditCard, Landmark, Truck, ShieldCheck } from "lucide-react"

export default function CheckoutForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping")

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    saveAddress: false,
  })

  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
    saveCard: false,
  })

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate shipping info
    if (
      !shippingInfo.firstName ||
      !shippingInfo.lastName ||
      !shippingInfo.email ||
      !shippingInfo.phone ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.zipCode
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate payment info for credit card
    if (paymentMethod === "credit-card") {
      if (!cardInfo.cardNumber || !cardInfo.cardName || !cardInfo.expiry || !cardInfo.cvc) {
        toast({
          title: "Missing payment information",
          description: "Please fill in all required payment fields.",
          variant: "destructive",
        })
        return
      }
    }

    setStep("review")
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to process the order
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear cart and redirect to success page
      clearCart()

      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      })

      router.push("/checkout/success")
    } catch (error) {
      toast({
        title: "Error placing order",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Tabs value={step} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shipping" onClick={() => setStep("shipping")} disabled={isSubmitting}>
            Shipping
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            onClick={() => setStep("payment")}
            disabled={step === "shipping" || isSubmitting}
          >
            Payment
          </TabsTrigger>
          <TabsTrigger
            value="review"
            onClick={() => setStep("review")}
            disabled={step === "shipping" || step === "payment" || isSubmitting}
          >
            Review
          </TabsTrigger>
        </TabsList>

        {/* Shipping Information */}
        <TabsContent value="shipping">
          <form onSubmit={handleShippingSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" value={shippingInfo.city} onChange={handleShippingInfoChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingInfoChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveAddress"
                checked={shippingInfo.saveAddress}
                onCheckedChange={(checked) => setShippingInfo((prev) => ({ ...prev, saveAddress: checked as boolean }))}
              />
              <Label htmlFor="saveAddress">Save this address for future orders</Label>
            </div>

            <Separator />

            <div>
              <h3 className="mb-4 font-medium">Shipping Method</h3>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="font-normal">
                      Standard Shipping (3-5 business days)
                    </Label>
                  </div>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="font-normal">
                      Express Shipping (1-2 business days)
                    </Label>
                  </div>
                  <span className="font-medium">$12.99</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overnight" id="overnight" />
                    <Label htmlFor="overnight" className="font-normal">
                      Overnight Shipping (Next business day)
                    </Label>
                  </div>
                  <span className="font-medium">$24.99</span>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Continue to Payment
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Payment Information */}
        <TabsContent value="payment">
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div>
              <h3 className="mb-4 font-medium">Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex items-center font-normal">
                      <CreditCard className="mr-2 h-4 w-4" /> Credit/Debit Card
                    </Label>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                    <Label htmlFor="bank-transfer" className="flex items-center font-normal">
                      <Landmark className="mr-2 h-4 w-4" /> Bank Transfer
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "credit-card" && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardInfo.cardNumber}
                    onChange={handleCardInfoChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card *</Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={cardInfo.cardName}
                    onChange={handleCardInfoChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date *</Label>
                    <Input
                      id="expiry"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={handleCardInfoChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC *</Label>
                    <Input id="cvc" name="cvc" placeholder="123" value={cardInfo.cvc} onChange={handleCardInfoChange} />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveCard"
                    checked={cardInfo.saveCard}
                    onCheckedChange={(checked) => setCardInfo((prev) => ({ ...prev, saveCard: checked as boolean }))}
                  />
                  <Label htmlFor="saveCard">Save this card for future purchases</Label>
                </div>
              </div>
            )}

            {paymentMethod === "bank-transfer" && (
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  You will receive bank transfer instructions on the next page after reviewing your order.
                </p>
              </div>
            )}

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Your payment information is encrypted and secure. We never store your full card details.
              </p>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep("shipping")}>
                Back to Shipping
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Review Order
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Order Review */}
        <TabsContent value="review">
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Shipping Information</h3>
              <div className="grid gap-1 text-sm">
                <p>
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p>{shippingInfo.address}</p>
                <p>
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                </p>
                <p>{shippingInfo.country}</p>
                <p className="mt-1">
                  <span className="font-medium">Email:</span> {shippingInfo.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {shippingInfo.phone}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Shipping Method</h3>
              <p className="flex items-center text-sm">
                <Truck className="mr-2 h-4 w-4" />
                {shippingMethod === "standard" && "Standard Shipping (3-5 business days)"}
                {shippingMethod === "express" && "Express Shipping (1-2 business days)"}
                {shippingMethod === "overnight" && "Overnight Shipping (Next business day)"}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Payment Method</h3>
              <p className="flex items-center text-sm">
                {paymentMethod === "credit-card" && (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit Card ending in {cardInfo.cardNumber.slice(-4) || "****"}
                  </>
                )}
                {paymentMethod === "bank-transfer" && (
                  <>
                    <Landmark className="mr-2 h-4 w-4" />
                    Bank Transfer
                  </>
                )}
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                By placing your order, you agree to RunAsh's Terms of Service and Privacy Policy. Your order will be
                processed immediately.
              </p>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep("payment")} disabled={isSubmitting}>
                Back to Payment
              </Button>
              <Button onClick={handlePlaceOrder} className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
        }
