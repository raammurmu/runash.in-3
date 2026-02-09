 
# Team Guide

## Documentation Governance

Use the documentation governance matrix to determine which guidance docs must be reviewed and updated for each change:

- `docs/DOC_GOVERNANCE.md`

Before requesting review, confirm all impacted docs from the matrix have been updated (or a follow-up issue has been linked with rationale).

 
# Team Guide

## Agent and MCP documentation

- [MCP Server Guide](./MCP_SERVER.md)
- [Agent Working Guide](./AGENTS.md)


# TEAM_GUIDE.md

Team operating guide placeholder.
Document collaboration norms, review expectations, release workflow, and ownership boundaries here.

 
# Team Guide

This guide defines ownership, workflow, and operational expectations for building and operating RunAsh.

## Team roles and responsibilities

### Product
- Owns roadmap, priorities, release scope, and customer outcomes.
- Writes product requirements and acceptance criteria.
- Signs off on scope changes before implementation starts.

### Frontend
- Owns user interface architecture, UX consistency, accessibility, and client performance.
- Maintains `app/`, `components/`, `hooks/`, and `styles/` implementation quality.
- Partners with Product on interaction design and acceptance validation.

### Backend
- Owns service and domain logic, data access patterns, APIs, and integration contracts.
- Maintains `lib/`, `services/`, and database schema scripts in `scripts/`.
- Owns backward compatibility and migration safety for API and data changes.

### AI/ML
- Owns AI-enabled product behavior, model/prompt quality, evaluation criteria, and guardrails.
- Maintains AI-related services and domain types, including recommendation and automation flows.
- Defines offline/online validation expectations for AI-powered features.

### DevOps
- Owns CI/CD, deployment safety, runtime observability, and infra reliability.
- Maintains environment configuration, operational runbooks, and release automation.
- Owns rollback execution and post-release monitoring.

### Security
- Owns secure defaults, authn/authz policy, incident response, and compliance alignment.
- Reviews high-risk changes (auth, billing, data access, encryption, secrets handling).
- Maintains threat model assumptions and security checklists.

## Ownership map by folder and domain

| Area | Primary owner | Secondary owner | Notes |
| --- | --- | --- | --- |
| `app/` | Frontend | Product | Route-level UX and page composition. |
| `components/` | Frontend | Product | Shared UI building blocks and visual consistency. |
| `hooks/` | Frontend | Backend | Client-side behavior and app state helpers. |
| `styles/` | Frontend | Product | Design system and styling standards. |
| `services/` | Backend | AI/ML | Core business services and platform integrations. |
| `lib/` | Backend | Security | Shared business logic, auth, billing, and data utilities. |
| `scripts/` | Backend | DevOps | Database schema, migration, and operational SQL. |
| `types/` | Backend | Frontend | Shared domain contracts and type safety. |
| `public/` | Frontend | Product | Static assets and content media. |
| `contexts/` | Frontend | Backend | App-level state boundaries and provider contracts. |
| `data/` | Backend | AI/ML | Seed/config data used by services and features. |

### Domain ownership references
- **Authentication**: `RUNASH-AUTH.md`, `SECURITY.md`, and auth-related modules in `lib/` are owned by Security + Backend.
- **Payments/Billing**: `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md`, `RunAsh_AI_Pay.md`, and billing/payment modules in `lib/` + `scripts/` are owned by Backend + Security with Product approval.

## Branch strategy, review SLAs, and merge policy

### Branch strategy
- `main`: production-ready branch; always deployable.
- `develop` (optional if used): integration branch for upcoming release bundles.
- Feature branches: `feature/<ticket-or-scope>`.
- Bugfix branches: `fix/<ticket-or-scope>`.
- Hotfix branches: `hotfix/<incident-id>` off `main`.

### Pull request and review SLA
- PRs should be opened within 1 business day of meaningful implementation start.
- Normal PR first review SLA: **24 business hours**.
- High-priority/security PR first review SLA: **4 business hours**.
- Author responds to review comments within **1 business day**.

### Merge policy
- Minimum approvals:
  - Standard changes: 1 approval from owning team.
  - Cross-cutting changes: 2 approvals (owning team + one affected team).
  - Security/auth/payment changes: mandatory Security review.
- Required checks before merge:
  - CI passes.
  - No unresolved blocking comments.
  - Release notes/changelog entry for user-facing change.
- Preferred merge method: **squash merge** with a clear summary and linked ticket.

## Incident and bug triage flow

### Severity levels
- **SEV-1 (Critical):** production outage, severe data loss risk, auth/payment failure, security breach.
- **SEV-2 (High):** major feature degradation, high business impact, no simple workaround.
- **SEV-3 (Medium):** partial degradation with workaround, moderate user impact.
- **SEV-4 (Low):** minor bugs, cosmetic issues, low-risk edge cases.

### Triage process
1. **Intake**: Capture report with timestamp, environment, owner, and reproduction details.
2. **Classify severity** using business impact + technical blast radius.
3. **Assign incident commander** (for SEV-1/SEV-2) and functional owners.
4. **Mitigate first**: stabilize service, use feature flags or rollback if needed.
5. **Resolve root cause** and ship validated fix.
6. **Communicate** status updates on agreed cadence:
   - SEV-1: every 30 minutes
   - SEV-2: hourly
   - SEV-3/4: daily or per sprint routine
7. **Postmortem** for SEV-1/SEV-2 within 3 business days, with action items and owners.

## Release checklist and rollback guidance

### Release checklist
- Scope freeze approved by Product.
- All required PR approvals and CI checks are green.
- Schema/data migrations reviewed and tested.
- Security-impacting changes reviewed by Security.
- Observability prepared (dashboards, alerts, error budgets).
- Release notes prepared and stakeholder communication drafted.
- Rollback plan validated before production deploy.

### Rollback guidance
- Prefer fast rollback for customer-impacting regressions.
- Rollback triggers include SEV-1 symptoms, error spikes, payment/auth failures, or data integrity anomalies.
- Rollback options:
  1. Revert deployment to previous stable artifact.
  2. Disable feature via feature flag/config toggle.
  3. Execute tested down-migration or compensating script when safe.
- After rollback, log timeline and begin incident RCA before re-release.

## How to propose architecture changes

All non-trivial architecture updates must be proposed via an RFC PR before implementation.

### Required artifacts
1. **RFC summary**
   - Problem statement and goals.
   - Proposed design and alternatives considered.
   - Decision rationale and success criteria.
2. **Migration notes**
   - Data/API migration steps, compatibility window, and rollout sequencing.
   - Backfill strategy and rollback constraints.
3. **Impact matrix**
   - A table of affected systems, teams, risks, and mitigations.
   - Explicit callout of security, compliance, performance, and cost impact.

### Approval expectations
- Required reviewers: owning team + all impacted team leads.
- Mandatory Security sign-off for auth/payment/data-boundary changes.
- Architecture PR must be approved before dependent implementation PRs merge.

# TEAM_GUIDE.md

Operational guide for RunAsh AI contributors.

## Ownership model
- **Frontend**: `app/`, `components/`, `contexts/`
- **Service layer**: `services/`
- **Platform/security/auth**: `RUNASH-AUTH.md`, `SECURITY.md`, auth integrations
- **Commerce/payment**: `RunAsh_AI_Pay.md`, `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md`
- **Data/runtime docs**: `PLATFORM_GUIDE.md`, `DRIZZLE_ORM.md`

## Delivery workflow
1. Create focused branch and small scoped PR.
2. Keep implementation and docs in sync.
3. Run checks locally (`npm run lint`, `npm run build` as possible).
4. Submit PR with validation + risk notes.

## Code review SLA
- Normal PRs: first review target within 1 business day.
- Hotfix/security PRs: prioritize same day.

## Incident severity guidance
- **SEV-1**: payment outage/security incident – immediate mitigation + rollback plan.
- **SEV-2**: core user-path failure – hotfix queue.
- **SEV-3**: non-critical UX/ops degradation – scheduled fix.

## Release checklist
- [ ] Lint/build pass
- [ ] Docs updated
- [ ] Monitoring notes included
- [ ] Rollback path clear

## Architecture change proposals
For medium/large structural changes include:
- concise rationale
- impacted modules
- migration/backward-compatibility plan
- test/validation plan




