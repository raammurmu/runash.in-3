import { type NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"
import { executeIdempotentMutation, getIdempotencyKeyFromHeaders } from "@/lib/idempotency"

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = getIdempotencyKeyFromHeaders(request.headers)
    if (!idempotencyKey) {
      return NextResponse.json({ error: "Missing required header: idempotency-key" }, { status: 400 })
    }

    const body = await request.json()
    const { amount, currency, paymentMethodId, metadata } = body

    // Validate required fields
    if (!amount || !currency || !paymentMethodId) {
      return NextResponse.json({ error: "Missing required fields: amount, currency, paymentMethodId" }, { status: 400 })
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    // Validate payment method
    const isValidMethod = await PaymentService.validatePaymentMethod(paymentMethodId, currency)
    if (!isValidMethod) {
      return NextResponse.json({ error: "Invalid payment method for the specified currency" }, { status: 400 })
    }

    const result = await executeIdempotentMutation({
      idempotencyKey,
      scope: "payment:create-intent",
      requestHash: JSON.stringify({ amount, currency, paymentMethodId, metadata: metadata || {} }),
      execute: async () => {
        const intent = await PaymentService.createPaymentIntent(amount, currency, paymentMethodId, metadata || {})

        return {
          statusCode: 200,
          response: {
            success: true,
            data: intent,
          },
        }
      },
    })

    return NextResponse.json(result.response, { status: result.statusCode })
  } catch (error) {
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD") {
      return NextResponse.json({ error: "Idempotency key reuse detected with a different payload" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
