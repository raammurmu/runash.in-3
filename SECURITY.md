# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.3.0.x   | :x: |
| 1.2.0.x   | :x:              |
| 1.1.0.x   | :x: |
| < 1.0.0   | :white_check_mark:              |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.

 
## 2026 Security hardening updates

- Added structured JSON logging with sensitive-field redaction for auth, payment, and webhook handlers.
- Added correlation and request IDs (`x-correlation-id`, `x-request-id`) propagated through middleware and API responses.
- Enforced dual quotas (per-IP + per-user) on abuse-sensitive routes including auth reset/register, chat, payment intent creation, and billing checkout.
- Added webhook replay protection and signature/timestamp verification for Stripe billing and email bounce callbacks.
- Added CI security scanning (npm audit + CodeQL) and SLO alert thresholds in `.github/monitoring/slo-thresholds.yml`.

## AI Chat Turn Hardening

The `POST /api/v1/agents/chat` endpoint includes mandatory runtime controls per request:

- **Authentication gate:** only authenticated sessions can open chat streams.
- **Rate limiting:** per-user/IP request windows reduce abuse and brute-force traffic.
- **Tool authorization:** requested tools are validated and mapped to RBAC permissions before use.
- **Correlation IDs:** each turn carries a request correlation identifier (`x-correlation-id`) for traceability.
- **Structured logging:** chat lifecycle events are logged as metadata-only records without prompt/response body data.
