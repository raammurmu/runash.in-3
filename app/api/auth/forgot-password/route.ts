import { type NextRequest, NextResponse } from "next/server"
import { createPasswordResetToken } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"
import { enforceDualQuota } from "@/lib/route-quota"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

const sql = neon(process.env.DATABASE_URL!)

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = request.headers.get("x-request-id") || generateCorrelationId()

  return withRequestContext({ correlationId, requestId, route: "/api/auth/forgot-password" }, async () => {
    try {
      const quotaResult = enforceDualQuota(request, "auth-forgot-password", {
        perIpLimit: 3,
        perUserLimit: 3,
        windowMs: 15 * 60_000,
        userId: request.headers.get("x-user-id"),
      })

      if (!quotaResult.allowed) {
        logEvent("warn", "Forgot password quota exceeded", { resetAt: quotaResult.resetAt })
        return NextResponse.json(
          { message: "Too many password reset attempts. Please try again later." },
          { status: 429 },
        )
      }

      const body = await request.json()

      const validationResult = forgotPasswordSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json({ message: "Invalid email address" }, { status: 400 })
      }

      const { email } = validationResult.data

      const [user] = await sql`
      SELECT id, email, name FROM users WHERE email = ${email}
    `

      if (!user) {
        return NextResponse.json({
          message: "If an account with that email exists, we've sent a password reset link.",
        })
      }

      const token = await createPasswordResetToken(user.id)

      await sendPasswordResetEmail(user.email, user.name, token)
      logEvent("info", "Password reset requested", { userId: String(user.id) })

      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link.",
        ...(process.env.NODE_ENV === "development" && {
          resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`,
        }),
      })
    } catch (error) {
      logEvent("error", "Forgot password error", { error: serializeError(error) })
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
  })
}
