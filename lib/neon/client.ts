import { createBrowserClient } from "@/lib/neon/ssr"
import type { Database } from "./types"

/**
 * Browser-safe Neon client for React hooks, client components, and shared UI services.
 *
 * Do not import this module from server-only codepaths that need cookie access
 * (use `@/lib/neon/server` for those cases).
 */
export const neon = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_NEON_URL!,
  process.env.NEXT_PUBLIC_NEON_ANON_KEY!,
)

// Compatibility alias for legacy imports that expect `createClient`.
export const createClient = () => neon
