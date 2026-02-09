# CODEX_CUSTOM_INSTRUCTIONS.md

RunAsh AI custom instructions for Codex contributors.

## Scope
These instructions apply to all Codex-driven changes in this repository.

## Core operating rules
1. Keep diffs focused and only change files required by the request.
2. Preserve backward compatibility for service/payment/auth flows unless versioned migration notes are included.
3. Never commit secrets, tokens, credentials, or customer-sensitive data.
4. Update docs when behavior, architecture, or workflows change.

## Validation policy (required)
- **For code changes** (`.ts`, `.tsx`, `.js`, `.mjs`, config/runtime files):
  - Run linters and relevant tests before handoff.
  - Minimum expected checks: `npm run lint` and `npm run build` when environment allows.
- **For docs-only changes** (`.md`, comments-only edits):
  - Do **not** require full test/lint runs.
  - Perform lightweight validation (spell/format consistency and link accuracy).

### Example rule
Run tests and linters for every code change, but do not require them when changing only code comments or documentation.

## PR checklist
- [ ] Scope and impacted modules identified
- [ ] Validation commands captured with outcomes
- [ ] Risks and rollback noted (for non-trivial changes)
- [ ] Relevant docs updated
