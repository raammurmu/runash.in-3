import { type NextRequest, NextResponse } from "next/server"
import { checkReplay, ensureTimestampWithinTolerance } from "@/lib/webhook-security"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = req.headers.get("x-request-id") || generateCorrelationId()

  return withRequestContext({ correlationId, requestId, route: "/api/billing/webhook" }, async () => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret) return NextResponse.json({ ok: true, skipped: "No STRIPE_WEBHOOK_SECRET set" })

    const sig = req.headers.get("stripe-signature") || ""
    if (!sig) {
      logEvent("warn", "Stripe webhook missing signature")
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 })
    }

    const raw = await req.text()
    const timestamp = req.headers.get("stripe-timestamp")
    if (timestamp && !ensureTimestampWithinTolerance(timestamp)) {
      logEvent("warn", "Stripe webhook timestamp outside tolerance")
      return NextResponse.json({ error: "Stale webhook timestamp" }, { status: 400 })
    }

    const { default: Stripe } = await import("stripe")
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || "", {
      apiVersion: "2024-06-20",
    })

    let event: any
    try {
      event = stripe.webhooks.constructEvent(raw, sig, secret)
    } catch (err: unknown) {
      logEvent("warn", "Invalid stripe webhook signature", { error: serializeError(err) })
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (!checkReplay(event.id)) {
      logEvent("warn", "Replay blocked for stripe webhook", { eventId: event.id })
      return NextResponse.json({ error: "Duplicate webhook event" }, { status: 409 })
    }

    try {
      switch (event.type) {
        case "invoice.payment_succeeded":
          break
        case "invoice.payment_failed":
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          break
        default:
          break
      }
    } catch (error: unknown) {
      logEvent("error", "Stripe webhook processing error", { error: serializeError(error), eventType: event.type })
      return NextResponse.json({ error: "Processing error" }, { status: 500 })
    }

    logEvent("info", "Stripe webhook processed", { eventId: event.id, eventType: event.type })
    return NextResponse.json({ received: true })
  })
}

export const dynamic = "force-dynamic"
