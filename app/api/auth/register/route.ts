import { type NextRequest } from "next/server"
import { createUser, generateEmailVerificationToken } from "@/lib/auth-utils"
import { neon } from "@neondatabase/serverless"
import { registerSchema } from "@/lib/validations/auth"
import { rateLimit } from "@/lib/rate-limit"
import { sendVerificationEmail } from "@/lib/email"
import { respondError, respondSuccess } from "@/lib/api/envelope"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
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

    const { email, password, name, username } = validationResult.data

    const [existingUser] = await sql`
      SELECT id, email, username FROM users 
      WHERE email = ${email} OR username = ${username}
    `

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
