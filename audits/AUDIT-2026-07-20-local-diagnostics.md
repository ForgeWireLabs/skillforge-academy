# AUDIT-2026-07-20-local-diagnostics: Local Diagnostics And Error-Reporting Stance

Type: implementation / privacy
Status: passed
Date: 2026-07-20
Auditor: Cursor agent
Related Todo: `225`

## Scope

Verify that SkillForge has an explicit no-telemetry stance, a user-controlled
local diagnostic export path, default redaction of sensitive learner content,
user-facing collection guidance, and safe failure behavior that does not
corrupt progress.

## Context

Work item `225` closed the support gap between "private by design" and practical
troubleshooting without introducing crash-report upload or analytics.

## Method

- Reviewed `decisions/0009-no-telemetry-local-diagnostic-export-only.md`.
- Reviewed `src/diagnostics.ts`, Preferences wiring in `src/App.tsx`, and docs.
- Ran unit tests covering redaction, error ring, and malformed-state recovery.
- Ran accessibility, TypeScript build, and content validation gates.

## Findings

### AC-1 through AC-4: Stance, export path, redaction, docs

Status: satisfied.

Decision 0009 locks the product to no telemetry / no automatic crash reporting /
local-export-only diagnostics. Preferences exposes Export diagnostics with an
explicit opt-in for display name and note text. `docs/diagnostics.md`,
`SECURITY.md`, README, getting-started, and backup-restore cross-links teach the
collection path.

### AC-5: Failure visibility and state safety

Status: satisfied.

Backup import/export failures surface status messages and record into the
in-session diagnostic error ring without calling `setState` on failure.
`migrateState` recovers malformed saves. Diagnostic construction does not mutate
learner state.

## Evidence

See `evidence/runs/20260720-225-local-diagnostics.json`.

## Risks

- Diagnostic files can still include attempt score history and content counts;
  users should share them only with trusted support.
- In-memory errors reset when the app restarts; reproduce the failure in-session
  before exporting when possible.
- Broader privacy/security review remains tracked by work item `227`.

## Final Status

Passed. Work item `225` is complete.
