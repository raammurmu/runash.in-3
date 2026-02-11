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
    const { intentId } = body

    if (!intentId) {
      return NextResponse.json({ error: "Missing required field: intentId" }, { status: 400 })
    }

    const result = await executeIdempotentMutation({
      idempotencyKey,
      scope: "payment:confirm",
      requestHash: JSON.stringify({ intentId }),
      execute: async () => {
        const transaction = await PaymentService.processPayment(intentId)

        return {
          statusCode: 200,
          response: {
            success: true,
            data: transaction,
          },
        }
      },
    })

    return NextResponse.json(result.response, { status: result.statusCode })
  } catch (error) {
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD") {
      return NextResponse.json({ error: "Idempotency key reuse detected with a different payload" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
