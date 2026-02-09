# Service Change Workflow

## Use when
Editing service logic in `services/`.

## Steps
1. Identify impacted inputs/outputs/contracts.
2. Preserve backward compatibility where possible.
3. Add/update docs for changed behavior.
4. Run lint/build checks.
5. Note risks and rollback in PR.
