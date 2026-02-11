import { type NextRequest } from "next/server"
import { PaymentService } from "@/lib/payment-service"
 
import { enforceDualQuota } from "@/lib/route-quota"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

import { respondError, respondSuccess } from "@/lib/api/envelope"


export async function POST(request: NextRequest): Promise<Response> {
  const correlationId = request.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = request.headers.get("x-request-id") || generateCorrelationId()

 
  return withRequestContext({ correlationId, requestId, route: "/api/payment/create-intent" }, async () => {
    try {
      const userId = request.headers.get("x-user-id")
      const quotaResult = enforceDualQuota(request, "payment-initiation", {
        perIpLimit: 20,
        perUserLimit: 10,
        windowMs: 60_000,
        userId,
      })

      if (!quotaResult.allowed) {
        logEvent("warn", "Payment initiation quota exceeded", { userId, resetAt: quotaResult.resetAt })
        return NextResponse.json({ error: "Too many payment attempts" }, { status: 429 })
      }

      const body = await request.json()
      const { amount, currency, paymentMethodId, metadata } = body

      if (!amount || !currency || !paymentMethodId) {
        return NextResponse.json({ error: "Missing required fields: amount, currency, paymentMethodId" }, { status: 400 })
      }

      if (typeof amount !== "number" || amount <= 0) {
        return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
      }

      const isValidMethod = await PaymentService.validatePaymentMethod(paymentMethodId, currency)
      if (!isValidMethod) {
        return NextResponse.json({ error: "Invalid payment method for the specified currency" }, { status: 400 })
      }

      const intent = await PaymentService.createPaymentIntent(amount, currency, paymentMethodId, metadata || {})
      logEvent("info", "Payment intent created", {
        amount,
        currency,
        paymentMethodId,
        userId,
        intentId: intent.id,
      })

      return NextResponse.json(
        {
          success: true,
          data: intent,
        },
        {
          headers: {
            "x-correlation-id": correlationId,
            "x-request-id": requestId,
          },
        },
      )
    } catch (error) {
      logEvent("error", "Payment intent creation failed", { error: serializeError(error) })
      return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
    }
  })

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

    const intent = await PaymentService.createPaymentIntent(amount, currency, paymentMethodId, metadata || {})

    return respondSuccess(request, intent, {
      legacy: {
        success: true,
        data: intent,
      },
    })
  } catch (error) {
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
