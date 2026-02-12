import type { Database } from "./types"

type SessionUser = {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

type Session = {
  user: SessionUser
}

type AuthListener = (event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED", session: Session | null) => void

function createAuthClient() {
  let session: Session | null = null
  const listeners = new Set<AuthListener>()

  const notify = (event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED") => {
    listeners.forEach((listener) => listener(event, session))
  }

  return {
    async getSession() {
      return { data: { session }, error: null }
    },
    async getUser() {
      return { data: { user: session?.user ?? null }, error: null }
    },
    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback)
      return {
        data: {
          subscription: {
            unsubscribe() {
              listeners.delete(callback)
            },
          },
        },
      }
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      session = { user: { id: email || "local-user", email } }
      notify("SIGNED_IN")
      return { error: null }
    },
    async signUp({ email, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
      session = { user: { id: email || "local-user", email, user_metadata: options?.data || {} } }
      notify("SIGNED_IN")
      return { error: null }
    },
    async signOut() {
      session = null
      notify("SIGNED_OUT")
      return { error: null }
    },
  }
}

export function createBrowserClient<T = Database>(_url: string, _anonKey: string) {
  return {
    auth: createAuthClient(),
  } as T & { auth: ReturnType<typeof createAuthClient> }
}

export function createServerClient<T = Database>(
  _url: string,
  _serviceRoleKey: string,
  _options?: { cookies?: { getAll: () => unknown[]; setAll?: (cookiesToSet: unknown[]) => void } },
) {
  return {
    auth: createAuthClient(),
  } as T & { auth: ReturnType<typeof createAuthClient> }
}
