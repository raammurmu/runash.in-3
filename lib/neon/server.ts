import "server-only"
import { createServerClient } from "@/lib/neon/ssr"
import { cookies } from "next/headers"
import type { Database } from "./types"

/**
 * Server-only Neon client bound to Next.js request cookies.
 *
 * Use this in Route Handlers, Server Components, and other server execution paths.
 */
export function createServerNeonClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(process.env.NEXT_PUBLIC_NEON_URL!, process.env.NEON_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Named export alias for compatibility
export const createClient = createServerNeonClient

export async function getUser() {
  const neon = createServerNeonClient()
  try {
    const {
      data: { user },
      error,
    } = await neon.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function getSession() {
  const neon = createServerNeonClient()
  try {
    const {
      data: { session },
      error,
    } = await neon.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}
