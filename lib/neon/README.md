# `lib/neon` module guide

Use the Neon modules based on runtime boundary:

- `@/lib/neon/client`
  - **Browser/runtime-safe client** for React client components, hooks, and UI-facing service helpers.
  - Exposes `neon` plus a compatibility `createClient()` alias.
  - Supports auth/session and realtime channel APIs (for example, `neon.channel(...).on(...).subscribe()`).

- `@/lib/neon/server`
  - **Server-only helpers** for Route Handlers, Server Components, and server-side auth/session checks.
  - Uses request cookies and is marked with `server-only` to avoid accidental client bundle usage.

## Rule of thumb

If a module can run in the browser (anything under client hooks/components), import from `client`.
If it depends on `next/headers`, request cookies, or service-role credentials, import from `server`.
