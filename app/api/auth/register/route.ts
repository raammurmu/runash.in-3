import { type NextRequest } from "next/server"
import { createUser, generateEmailVerificationToken } from "@/lib/auth-utils"
import { neon } from "@neondatabase/serverless"
import { registerSchema } from "@/lib/validations/auth"
import { sendVerificationEmail } from "@/lib/email"
 
import { enforceDualQuota } from "@/lib/route-quota"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

import { respondError, respondSuccess } from "@/lib/api/envelope"


const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
 
  const correlationId = request.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = request.headers.get("x-request-id") || generateCorrelationId()

  try {
    const rateLimitResult = await rateLimit(request, "register", 5, 900) // 5 attempts per 15 minutes
    if (!rateLimitResult.success) {
      return respondError(
        request,
        {
          code: "RATE_LIMITED",
          message: "Too many registration attempts. Please try again later.",
        },
        { status: 429, legacy: { message: "Too many registration attempts. Please try again later." } },
      )
    }


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
      return respondError(
        request,
        {
          code: "VALIDATION_FAILED",
          message: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        {
          status: 400,
          legacy: {
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors,
          },
        },
      )
    }


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

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "username"
      return respondError(
        request,
        {
          code: "USER_EXISTS",
          message: `User with this ${conflictField} already exists`,
          details: { field: conflictField },
        },
        { status: 409, legacy: { message: `User with this ${conflictField} already exists` } },
      )
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

    const createdUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      emailVerified: false,
    }

    return respondSuccess(
      request,
      {
        message: "User created successfully. Please check your email to verify your account.",
        user: createdUser,
      },
      {
        status: 201,
        legacy: {
          message: "User created successfully. Please check your email to verify your account.",
          user: createdUser,
        },
      },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return respondError(
      request,
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500, legacy: { message: "Internal server error" } },
    )
  }

}
