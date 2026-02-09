 
# AGENTS

## Documentation Governance Requirement

All human and AI contributors must consult `docs/DOC_GOVERNANCE.md` when submitting changes that may impact features, infrastructure, or policy.

If any guidance documents are impacted according to the governance matrix, update them in the same PR or link a follow-up issue with justification.

 
# Agent Working Guide

For MCP usage patterns, safety constraints, and troubleshooting, see:

- [MCP Server Guide](./MCP_SERVER.md)

 
# Agent Working Notes

## Skills discoverability

This repository keeps reusable workflow playbooks in [`SKILLS/README.md`](./SKILLS/README.md).

Direct links:
- [Frontend Feature Workflow](./SKILLS/frontend-feature-workflow.md)
- [Service Layer Change Workflow](./SKILLS/service-layer-change-workflow.md)
- [Auth & Payment Change Workflow](./SKILLS/auth-payment-change-workflow.md)
- [Docs Quality Review Workflow](./SKILLS/docs-quality-review-workflow.md)


# AGENTS.md

This file is a placeholder index for agent-facing repository instructions.
Refer to project and team guides for implementation details and standards.

 
# AGENTS

## Documentation map
- Team process and ownership guidance: [`TEAM_GUIDE.md`](./TEAM_GUIDE.md)

Use `TEAM_GUIDE.md` for roles, ownership boundaries, review and merge policy, incident triage, release checklist, rollback guidance, and architecture change proposals.

 
# AGENTS.md — RunAsh AI Default Repository Policy

## 1) Project identity and mission

RunAsh AI is an open-source, agentic live commerce and retail automation platform focused on:
- real-time video generation and streaming,
- multimodal AI tooling,
- production-grade developer and operator workflows.

When contributing, prioritize outcomes that improve reliability, user trust, operational clarity, and long-term maintainability of the RunAsh ecosystem.

## 2) Mandatory workflow (always follow)

1. **Read before edit**
   - Read the target file(s) and related interfaces/dependencies before changing code.
   - Confirm existing patterns (folder structure, naming, data flow, and API contracts) and follow them.
2. **Keep diffs minimal and scoped**
   - Change only what is needed for the request.
   - Avoid opportunistic refactors unless they are required to safely complete the task.
3. **Preserve architecture**
   - Do not introduce new architectural layers, frameworks, or abstractions unless explicitly requested.
   - Preserve established boundaries (UI vs domain logic vs data access) and module responsibilities.
4. **Validate changes**
   - Run lint/type/build/test commands relevant to the touched area when available.
   - If a check cannot run due to environment constraints, explicitly note it.
5. **Explain intent clearly**
   - Summarize what changed, why, risk level, and any follow-up actions in PR descriptions.

## 3) Coding standards (TypeScript / React / Next.js)

### General
- Prefer TypeScript-first, strict-safe patterns; avoid `any` unless justified and documented.
- Prefer clear, composable, side-effect-light functions.
- Keep modules focused; avoid bloated files and cross-concern leakage.

### React / Next.js
- Use function components and hooks.
- Use Server/Client Components intentionally; add `"use client"` only when needed.
- Keep data fetching close to the server boundary when possible.
- Prefer explicit props types/interfaces and descriptive prop names.
- Favor accessibility defaults (semantic elements, labels, keyboard-friendly interactions).

### Naming and structure
- Use descriptive names:
  - `PascalCase` for React components and types.
  - `camelCase` for variables/functions.
  - `SCREAMING_SNAKE_CASE` for immutable global constants/env keys.
- Avoid abbreviations that reduce readability.
- Match existing directory and route conventions.

### Lint / formatting expectations
- Code must pass repository linting/formatting and TypeScript checks when configured.
- Do not suppress lint/type rules unless there is a clear, documented reason.
- Keep imports tidy and remove dead code.

## 4) Documentation update requirements

When behavior visible to users, operators, or integrators changes, update docs in the same PR.

At minimum, update whichever applies:
- `README.md` for setup, usage, or workflow changes.
- API/docs references for contract changes.
- Environment variable documentation (`.env.example` and related docs) for config changes.
- Migration or rollout notes for breaking/operationally sensitive changes.

If no docs updates are needed, state that explicitly in the PR body.

## 5) Pull request requirements

### PR title template
`<type>(<scope>): <short summary>`

Examples of `type`: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.

### PR body template
```md
## Summary
- What changed
- Why it changed

## Validation
- [ ] lint
- [ ] typecheck
- [ ] tests
- [ ] build (if applicable)

## Documentation
- Docs updated: <yes/no>
- If no, explain why.

## Risk & rollout
- Risk level: <low/medium/high>
- User impact: <none/internal/external>
- Rollback plan: <brief>

## Notes
- Follow-ups, limitations, or assumptions
```

### PR checklist expectations
- Keep PRs small and reviewable.
- Include risk notes for non-trivial changes.
- Flag breaking changes clearly.
- Include screenshots for visual UI changes when practical.

## 6) Safety and secrets handling

- **Never** hardcode secrets, API keys, tokens, or credentials in code, tests, fixtures, or docs.
- Use environment variables for sensitive values and document required keys.
- Keep `.env.local` and other secret-bearing files out of version control.
- Redact sensitive information from logs, screenshots, and PR descriptions.
- Apply least-privilege principles for tokens and service accounts.
- If a secret is exposed accidentally, rotate/revoke it immediately and note mitigation steps in the PR.

# AGENTS.md

Repository-wide operating guidance for human and AI contributors to **RunAsh AI**.

## 1) Mission and product context
RunAsh AI is an agentic live commerce platform spanning video generation, streaming, seller tooling, automation services, and commerce operations.

## 2) Default contribution workflow
1. Read impacted files first; preserve existing architecture and naming patterns.
2. Prefer small, focused diffs over broad rewrites.
3. Update documentation whenever behavior, contracts, or workflows change.
4. Run local checks before submitting (`npm run lint`, `npm run build` when feasible).
5. Include risk notes and rollback thoughts in PR descriptions.

## 3) Coding and quality conventions
- Stack baseline: Next.js + TypeScript + React.
- Keep components/services cohesive; avoid unrelated refactors.
- Preserve public APIs unless migration notes are included.
- Never add secrets/tokens in source code or docs.
- Do not add `try/catch` around import statements.

## 4) Required docs synchronization
When changing any area below, update linked docs in the same PR:
- Auth/security: `RUNASH-AUTH.md`, `SECURITY.md`
- Platform/runtime behavior: `PLATFORM_GUIDE.md`
- Payments: `RunAsh_AI_Pay.md`, `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md`
- Agent workflows: `AGENTS.override.md`, `LLMs.txt`, `MCP_SERVER.md`, `SKILLS/*`

## 5) PR expectations
PRs should include:
- Problem statement
- What changed
- Validation commands run and outcomes
- Risks / backward compatibility notes
- Follow-up tasks

## 6) Override policy
`AGENTS.override.md` can define temporary or critical directives (e.g., release freeze, security hardening sprint, payment hotfix windows). If conflicts exist, override rules win for the defined scope and time.

## 7) Documentation map
- `TEAM_GUIDE.md` – team process and ownership
- `LLMs.txt` – compact AI/LLM contributor briefing
- `MCP_SERVER.md` – MCP server integration standards
- `SKILLS/README.md` – reusable contribution playbooks
- `CODEX_CUSTOM_INSTRUCTIONS.md` – RunAsh AI Codex-specific execution and validation rules






