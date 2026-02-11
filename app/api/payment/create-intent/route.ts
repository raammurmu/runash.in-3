 
import { type NextRequest, NextResponse } from "next/server"
import { executeIdempotentMutation, getIdempotencyKeyFromHeaders } from "@/lib/idempotency"

import { type NextRequest } from "next/server"

import { PaymentService } from "@/lib/payment-service"
import { respondError, respondSuccess } from "@/lib/api/envelope"

type CreateIntentRequest = {
  amount?: number
  currency?: string
  paymentMethodId?: string
  metadata?: Record<string, unknown>
}

const IDEMPOTENCY_CONFLICT = "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD"

function parseCreateIntentRequest(payload: unknown): CreateIntentRequest {
  if (!payload || typeof payload !== "object") {
    return {}
  }

  return payload as CreateIntentRequest
}

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = getIdempotencyKeyFromHeaders(request.headers)
    if (!idempotencyKey) {
      return NextResponse.json({ error: "Missing required header: idempotency-key" }, { status: 400 })
    }

    const body = parseCreateIntentRequest(await request.json())
    const { amount, currency, paymentMethodId, metadata = {} } = body

    if (!amount || !currency || !paymentMethodId) {
      return respondError(
        request,
        {
          code: "MISSING_REQUIRED_FIELDS",
          message: "Missing required fields: amount, currency, paymentMethodId",
        },
        {
          status: 400,
          legacy: { error: "Missing required fields: amount, currency, paymentMethodId" },
        },
      )
    }

    if (typeof amount !== "number" || amount <= 0) {
      return respondError(
        request,
        {
          code: "INVALID_AMOUNT",
          message: "Amount must be a positive number",
        },
        {
          status: 400,
          legacy: { error: "Amount must be a positive number" },
        },
      )
    }

    const isValidMethod = await PaymentService.validatePaymentMethod(paymentMethodId, currency)
    if (!isValidMethod) {
      return respondError(
        request,
        {
          code: "INVALID_PAYMENT_METHOD",
          message: "Invalid payment method for the specified currency",
        },
        {
          status: 400,
          legacy: { error: "Invalid payment method for the specified currency" },
        },
      )
    }

 
    const result = await executeIdempotentMutation({
      idempotencyKey,
      scope: "payment:create-intent",
      requestHash: JSON.stringify({ amount, currency, paymentMethodId, metadata }),
      execute: async () => {
        const intent = await PaymentService.createPaymentIntent(amount, currency, paymentMethodId, metadata)

        return {
          statusCode: 200,
          response: {
            success: true,
            data: intent,
          },
        }

    const intent = await PaymentService.createPaymentIntent(amount, currency, paymentMethodId, metadata || {})

    return respondSuccess(request, intent, {
      legacy: {
        success: true,
        data: intent,

      },
    })

    return NextResponse.json(result.response, { status: result.statusCode })
  } catch (error) {
 
    if (error instanceof Error && error.message === IDEMPOTENCY_CONFLICT) {
      return NextResponse.json({ error: "Idempotency key reuse detected with a different payload" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })

    console.error("Payment intent creation failed:", error)
    return respondError(
      request,
      {
        code: "PAYMENT_INTENT_CREATION_FAILED",
        message: "Failed to create payment intent",
      },
      {
        status: 500,
        legacy: { error: "Failed to create payment intent" },
      },
    )

  }
}
