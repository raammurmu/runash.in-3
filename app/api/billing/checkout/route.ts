// Create a Stripe Checkout Session for subscriptions
import { type NextRequest, NextResponse } from "next/server"
import { enforceDualQuota } from "@/lib/route-quota"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = req.headers.get("x-request-id") || generateCorrelationId()

  return withRequestContext({ correlationId, requestId, route: "/api/billing/checkout" }, async () => {
    try {
      const quotaResult = enforceDualQuota(req, "billing-checkout", {
        perIpLimit: 20,
        perUserLimit: 10,
        windowMs: 60_000,
        userId: req.headers.get("x-user-id"),
      })

      if (!quotaResult.allowed) {
        return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 })
      }

      const { priceId, customerEmail, mode = "subscription", success_url, cancel_url } = await req.json()

      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
      }
      if (!priceId || !success_url || !cancel_url) {
        return NextResponse.json({ error: "Missing required fields: priceId, success_url, cancel_url" }, { status: 400 })
      }

      const { default: Stripe } = await import("stripe")
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" })

      const session = await stripe.checkout.sessions.create({
        mode,
        success_url,
        cancel_url,
        customer_email: customerEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
      })

      logEvent("info", "Stripe checkout session created", { priceId, mode, checkoutSessionId: session.id })

      return NextResponse.json({ url: session.url })
    } catch (error) {
      logEvent("error", "Failed to create checkout session", { error: serializeError(error) })
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
    }
  })
}

export const dynamic = "force-dynamic"
