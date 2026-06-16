# Todo System

The `todos/` folder is the durable work queue for SkillForge Academy. It is intentionally simple markdown so work remains usable before adopting any heavier orchestration system.

## Files

- `index.md`: summary table for all todos.
- `TODO-###-slug.md`: one durable work item.
- `TEMPLATE.md`: copyable todo skeleton.

## ID Format

Use:

```text
TODO-001-short-slug
```

Rules:

- IDs are never reused.
- Use three digits until `999`; then move to four digits.
- Keep slugs lowercase and hyphenated.
- Preserve old files when superseding; link to the replacement.

## Required Fields

Every todo must include:

- ID
- Title
- Status
- Owner
- Created
- Updated
- Priority
- Area
- Problem
- Outcome
- Acceptance criteria
- Verification plan
- Progress log

## Status Flow

```text
proposed -> ready -> active -> review -> done
                 \-> blocked
                 \-> superseded
```

## Priority

- `P0`: urgent, release-blocking, data-loss, security, or severe regression.
- `P1`: important platform or user-facing work.
- `P2`: valuable improvement with manageable risk.
- `P3`: cleanup, polish, or optional follow-up.

## Completion Rule

A todo is not done until acceptance criteria and verification are recorded in the todo file and any relevant tracking files are updated.

## Creating A Todo

1. Copy `TEMPLATE.md`.
2. Rename it to `TODO-###-slug.md`.
3. Add it to `index.md`.
4. If it changes direction or architecture, add a decision entry.
5. If it carries meaningful uncertainty, add a risk entry.

