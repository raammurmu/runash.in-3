import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateEmailVerificationToken } from "@/lib/auth-utils"
import { neon } from "@neondatabase/serverless"
import { registerSchema } from "@/lib/validations/auth"
import { sendVerificationEmail } from "@/lib/email"
import { enforceDualQuota } from "@/lib/route-quota"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = request.headers.get("x-request-id") || generateCorrelationId()

  return withRequestContext({ correlationId, requestId, route: "/api/auth/register" }, async () => {
    try {
      const quotaResult = enforceDualQuota(request, "auth-register", {
        perIpLimit: 5,
        perUserLimit: 3,
        windowMs: 15 * 60_000,
        userId: request.headers.get("x-user-id"),
      })

      if (!quotaResult.allowed) {
        logEvent("warn", "Registration quota exceeded", { resetAt: quotaResult.resetAt })
        return NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 })
      }

      const body = await request.json()

      const validationResult = registerSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          {
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors,
          },
          { status: 400 },
        )
      }

      const { email, password, name, username } = validationResult.data

      const [existingUser] = await sql`
      SELECT id, email, username FROM users 
      WHERE email = ${email} OR username = ${username}
    `

      if (existingUser) {
        const conflictField = existingUser.email === email ? "email" : "username"
        return NextResponse.json({ message: `User with this ${conflictField} already exists` }, { status: 409 })
      }

      const user = await createUser({
        email,
        password,
        name,
        username,
        role: "user",
      })

      const verificationToken = await generateEmailVerificationToken(user.id)
      await sendVerificationEmail(email, name, verificationToken)

      logEvent("info", "User registration succeeded", {
        userId: String(user.id),
      })

      return NextResponse.json(
        {
          message: "User created successfully. Please check your email to verify your account.",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            emailVerified: false,
          },
        },
        { status: 201 },
      )
    } catch (error) {
      logEvent("error", "Registration error", { error: serializeError(error) })
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
  })
}
