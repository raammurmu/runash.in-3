 
# AGENTS.override.md

Use this file for temporary, scoped overrides to AGENTS.md guidance when needed.
If empty or unchanged, AGENTS.md remains the default instruction source.

 
# AGENTS.override.md — Temporary / Higher-Priority Directives

This file defines temporary execution rules that can supersede the default repository policy in `AGENTS.md` when explicitly activated.

## 1) When this override applies

Override rules apply only when one of the following trigger conditions is explicitly present in the task/request:

1. The request references `AGENTS.override.md` by name.
2. The request includes an explicit activation phrase such as:
   - `OVERRIDE:ON`
   - `CAMPAIGN:<name>`
   - `RELEASE:<version-or-window>`
3. A maintainer marks work as time-critical release/campaign execution and includes a concrete directive block using the format below.

If none of these conditions are met, `AGENTS.md` remains the active policy.

## 2) Conflict precedence

When activated:
1. Direct system/developer/user instructions have highest priority.
2. `AGENTS.override.md` takes precedence over `AGENTS.md` for conflicting instructions.
3. Any rule not explicitly overridden continues to follow `AGENTS.md`.

Overrides are temporary and should be removed or marked inactive once the campaign/release window ends.

## 3) Lightweight temporary directive format

Use this minimal block for campaign/release directives:

```md
[DIRECTIVE]
name: <campaign-or-release-name>
status: <active|inactive>
window: <start-end or "until revoked">
owner: <team-or-person>
priority: <low|medium|high|critical>

goals:
- <goal 1>
- <goal 2>

required-actions:
- <must-do action>
- <must-do action>

temporary-rules:
- <rule overriding default behavior>
- <rule overriding default behavior>

exit-criteria:
- <condition to deactivate directive>

reporting:
- update-frequency: <e.g., daily>
- channel: <link or identifier>
[/DIRECTIVE]
```

### Usage notes
- Keep directives concise, testable, and time-bounded.
- Prefer scoped overrides over broad process exceptions.
- If a temporary rule increases risk (e.g., reduced test coverage), document mitigation and rollback steps in the PR.

# AGENTS.override.md

High-priority directives that override `AGENTS.md` when applicable.

## Active override: Service & Payment Reliability

### Scope
Applies to changes touching:
- `services/**`
- payment/auth/business flows
- files: `RunAsh_AI_Pay.md`, `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md`, `RUNASH-AUTH.md`, `SECURITY.md`

### Mandatory rules
1. **Safety first:** no breaking changes to payment flow contracts without migration notes.
2. **Backward compatibility:** preserve existing field names and API signatures unless explicitly versioned.
3. **Auditability:** document payment-impacting behavior changes in PR body and in payment docs.
4. **Security hardening:** never log sensitive payment/auth data.
5. **Validation floor:** run `npm run lint`; run `npm run build` when dependencies are available.

### Change checklist (required)
- [ ] Impacted payment/auth flows identified
- [ ] Risks + rollback noted
- [ ] Docs updated (`RunAsh_AI_Pay.md` and/or `RUNASH_PAY_BUSINESS_IMPLEMENTATION.md`)
- [ ] Validation commands captured

## Precedence
- This file overrides `AGENTS.md` for scoped files.
- If no active override applies, follow `AGENTS.md`.


