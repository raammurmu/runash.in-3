import * as crypto from "crypto"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

const TURN_CREDENTIAL_TTL_SECONDS = 10 * 60 // 10 minutes for browser sessions
const TURN_SERVER_SECRET = process.env.TURN_SERVER_SECRET
const TURN_SERVER_URLS = (process.env.TURN_SERVER_URLS || process.env.NEXT_PUBLIC_TURN_SERVER_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean)

export async function GET(request: NextRequest) {
  try {
    if (!TURN_SERVER_SECRET) {
      console.error("TURN credential issue blocked: TURN_SERVER_SECRET is not configured")
      return NextResponse.json({ error: "TURN server is not configured" }, { status: 500 })
    }

    if (TURN_SERVER_URLS.length === 0) {
      console.error("TURN credential issue blocked: TURN server URL is not configured")
      return NextResponse.json({ error: "TURN server URL is not configured" }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const rateLimitResult = await rateLimit(request, `turn-credentials:${userId}`, 20, 300)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many TURN credential requests. Please try again later.",
          retryAt: rateLimitResult.resetTime,
        },
        { status: 429 },
      )
    }

    const issuedAt = Math.floor(Date.now() / 1000)
    const expiresAt = issuedAt + TURN_CREDENTIAL_TTL_SECONDS
    const username = `${expiresAt}:${userId}`

    const hmac = crypto.createHmac("sha1", TURN_SERVER_SECRET)
    hmac.update(username)
    const credential = hmac.digest("base64")

    console.info("TURN credentials issued", {
      userId,
      issuedAt,
      expiresAt,
    })

    return NextResponse.json({
      iceServers: [
        {
          urls: TURN_SERVER_URLS,
          username,
          credential,
        },
      ],
      username,
      credential,
      ttl: TURN_CREDENTIAL_TTL_SECONDS,
      issuedAt,
      expiresAt,
    })
  } catch (error) {
    console.error("Error generating TURN credentials:", error)
    return NextResponse.json({ error: "Failed to generate TURN credentials" }, { status: 500 })
  }
}
