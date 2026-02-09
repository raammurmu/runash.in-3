# Documentation Governance Matrix

This matrix defines ownership, maintenance triggers, review frequency, and required cross-links for RunAsh guidance documentation.

| Guidance doc | Owner role | Update trigger | Review cadence | Required cross-links |
| --- | --- | --- | --- | --- |
| `README.md` | Engineering Lead | Feature changes that affect setup, architecture overview, or developer workflows | Monthly | `PLATFORM_GUIDE.md`, `TEAM_GUIDE.md` |
| `PLATFORM_GUIDE.md` | Platform Architect | Feature changes in core platform capabilities; infra changes in deployment/runtime topology | Monthly | `README.md`, `STARTUP_VS_BUSINESS_FEATURE_GUIDE.md`, `docs/DOC_GOVERNANCE.md` |
| `RUNASH-AUTH.md` | Security Engineer | Feature changes in auth flows; policy changes in identity/security controls | Monthly | `SECURITY.md`, `PLATFORM_GUIDE.md`, `docs/DOC_GOVERNANCE.md` |
| `SECURITY.md` | Security Lead | Policy changes to security standards; infra changes affecting threat model/compliance | Monthly | `RUNASH-AUTH.md`, `README.md`, `docs/DOC_GOVERNANCE.md` |
| `DRIZZLE_ORM.md` | Data/Backend Lead | Feature changes impacting ORM models or data access patterns; infra changes to data stack | Quarterly | `MIGRATION_PLAN.md`, `PLATFORM_GUIDE.md` |
| `MIGRATION_PLAN.md` | Database Engineer | Infra changes in database/hosting; feature changes requiring schema or data migration | Per release | `DRIZZLE_ORM.md`, `PLATFORM_GUIDE.md`, `docs/DOC_GOVERNANCE.md` |
| `STARTUP_VS_BUSINESS_FEATURE_GUIDE.md` | Product Manager | Feature changes that alter SKU/tier boundaries or roadmap framing | Quarterly | `PLATFORM_GUIDE.md`, `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md` |
| `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md` | Fintech Product Owner | Feature changes in payments/business flows; policy changes in payment governance | Per release | `RunAsh_AI_Pay.md`, `STARTUP_VS_BUSINESS_FEATURE_GUIDE.md`, `docs/DOC_GOVERNANCE.md` |
| `RunAsh_AI_Pay.md` | Payments Engineering Lead | Feature changes in AI Pay workflows; infra changes in payment processing integrations | Per release | `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md`, `SECURITY.md` |
| `LIVE_COMMERCE_SUMMARY.md` | Live Commerce PM | Feature changes in live commerce experiences or integrations | Quarterly | `PLATFORM_GUIDE.md`, `README.md` |
| `AGENTIC_IMPLEMENTATION_PLAN.md` | AI Systems Lead | Feature changes in agentic capabilities; policy changes on AI guardrails | Per release | `IMPLEMENTATION _SUMMARY.md`, `PLATFORM_GUIDE.md`, `docs/DOC_GOVERNANCE.md` |
| `IMPLEMENTATION _SUMMARY.md` | Tech Program Manager | Feature/infra milestones completed or re-scoped | Per release | `AGENTIC_IMPLEMENTATION_PLAN.md`, `MIGRATION_PLAN.md` |
| `TEAM_GUIDE.md` | Engineering Manager | Policy changes in team process; feature/infra changes requiring workflow updates | Monthly | `.github/pull_request_template.md`, `docs/DOC_GOVERNANCE.md`, `AGENTS.md` |
| `AGENTS.md` | Developer Experience Lead | Policy changes affecting AI/automation contribution workflow | Monthly | `TEAM_GUIDE.md`, `docs/DOC_GOVERNANCE.md` |

## Governance Rules

1. Any PR that changes product behavior, infrastructure, or policy must evaluate impacted guidance docs.
2. If a guidance doc is impacted, update it in the same PR whenever possible.
3. If a same-PR update is not possible, include a follow-up issue link in the PR description.
