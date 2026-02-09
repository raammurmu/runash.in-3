# Service Layer Change Workflow

## When to use

Use this workflow when modifying backend-facing logic such as API handlers, data access, business rules, integrations, or service abstractions.

## Required inputs

- Problem statement and expected service behavior.
- Impacted endpoints/services/modules.
- Data model/schema expectations.
- Error handling and retry expectations.
- Performance or latency constraints.

## Step-by-step procedure

1. Trace request flow from entrypoint to service/data layers.
2. Identify all callers and downstream dependencies before changing interfaces.
3. Implement business logic changes with clear boundaries (handler vs service vs data access).
4. Keep side effects explicit (logging, network calls, DB writes).
5. Add/update guards for invalid inputs and failure paths.
6. Update tests around changed behavior and edge cases.
7. Run lint/tests and verify no regressions in related feature paths.
8. Document contract changes for frontend and integration consumers.

## Validation checklist

- [ ] Request/response contract remains valid or is intentionally versioned.
- [ ] Error paths return predictable status and message shapes.
- [ ] Data writes are idempotent where expected.
- [ ] Existing callers compile/run without interface breakage.
- [ ] Lint and tests pass locally.
- [ ] Updated docs for any API/service contract changes.

## Common pitfalls specific to this repo

- Implicit coupling between UI and service response shapes can break pages without obvious compile errors.
- Environment variables for third-party services are easy to miss locally.
- Drizzle/DB schema assumptions can drift from code if migrations are not aligned.
- Quick fixes in route handlers can bypass shared business logic and duplicate behavior.
