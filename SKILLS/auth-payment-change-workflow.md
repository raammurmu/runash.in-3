# Auth & Payment Change Workflow

 
## When to use

Use this workflow for authentication, authorization, identity/session handling, billing flows, subscriptions, checkout, webhooks, or payment state transitions.

## Required inputs

- Security and compliance requirements for the change.
- Auth/payment provider details and impacted environments.
- User journey expectations (sign-in, upgrade, renewal, failure recovery).
- Required roles/permissions and access boundaries.
- Webhook/event mappings and reconciliation rules.

## Step-by-step procedure

1. Map the full state machine (unauthenticated -> authenticated -> paid/unpaid states).
2. Confirm trusted boundaries: client, server, provider callbacks/webhooks.
3. Implement changes server-first for auth/payment truth; keep client as presentation.
4. Validate signatures/tokens/webhook authenticity before processing events.
5. Ensure authorization checks protect every privileged action.
6. Handle retries, duplicate events, and out-of-order webhooks safely.
7. Add audit-friendly logging without exposing secrets/PII.
8. Test happy path and failure paths (declined payment, expired session, revoked access).
9. Update docs for env vars, callback URLs, and operational runbooks.

## Validation checklist

- [ ] No secrets or tokens exposed in logs/client payloads.
- [ ] Access checks enforced for protected operations.
- [ ] Payment status is derived from trusted server/provider data.
- [ ] Webhook verification and idempotency logic are present.
- [ ] Session/auth expiration paths are handled cleanly.
- [ ] End-to-end flow tested for success and failure scenarios.

## Common pitfalls specific to this repo

- Missing local env setup can make auth/payment look broken when code is correct.
- Client-side assumptions about subscription status can diverge from backend truth.
- Webhook endpoints may fail silently without explicit local tunneling/provider config.
- Mixed concerns in a single route can blur auth checks and billing logic.

## Use when
Touching auth/payment/business-critical logic.

## Steps
1. Confirm override rules in `AGENTS.override.md`.
2. Avoid contract breaks unless versioned/migrated.
3. Sanitize logging and avoid sensitive-data exposure.
4. Update payment/auth docs.
5. Validate with lint/build and record outcomes.

