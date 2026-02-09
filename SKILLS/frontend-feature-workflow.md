# Frontend Feature Workflow

 
## When to use

Use this workflow when changing user-facing UI in the Next.js app (new components, layout updates, styling changes, interactions, navigation, or page-level feature additions).

## Required inputs

- Feature goal and acceptance criteria.
- Target routes/pages/components.
- Design expectations (mock, copy, spacing rules, responsive behavior).
- Any API/data dependencies and fallback behavior.
- Definition of done for accessibility and mobile behavior.

## Step-by-step procedure

1. Identify affected UI surfaces in `app/`, `components/`, and related style files.
2. Confirm whether the feature should be server or client rendered before editing (`"use client"` only when needed).
3. Implement the smallest set of component and styling changes required.
4. Reuse existing shared UI patterns/components where possible to keep consistency.
5. Ensure loading/empty/error states are explicit when data is involved.
6. Verify semantic HTML, keyboard navigation, and readable contrast.
7. Run local checks and capture a screenshot when the visual output changes.
8. Update relevant docs if behavior, route flow, or UI usage changed.

## Validation checklist

- [ ] Feature behavior matches acceptance criteria.
- [ ] No hydration/client-server mismatch warnings.
- [ ] Mobile and desktop layouts are acceptable.
- [ ] Interactive elements are keyboard reachable.
- [ ] `npm run lint` passes (or equivalent project lint command).
- [ ] Visual change validated with screenshot evidence.

## Common pitfalls specific to this repo

- Mixing server and client component patterns can cause hydration/runtime issues.
- Environment-dependent UI can silently fail if `.env.local` keys are missing.
- Broad style edits can unintentionally affect generated/landing page content.
- Vercel/v0-synced content in root docs can be overwritten; keep product-facing docs scoped and additive.

## Use when
Adding or updating UI behavior in `app/` or `components/`.

## Steps
1. Inspect related components/routes.
2. Implement minimal UI change.
3. Ensure accessibility labels and responsive behavior.
4. Run lint/build checks.
5. Update docs if user-facing behavior changed.

