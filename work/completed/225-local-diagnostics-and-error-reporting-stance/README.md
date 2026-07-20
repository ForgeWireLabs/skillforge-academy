# 225 - Local diagnostics and error-reporting stance

> **Status**: Completed
> **Owners**: Steward lead; Desktop Specialist support.
> **Depends on**: none.

## Intent

Offline/private is a product promise, but support needs some way to diagnose
failures. This item decides whether SkillForge has no telemetry, optional local
diagnostic export, or opt-in crash reporting, then implements the smallest
privacy-preserving support path.

## Scope

- Telemetry/crash-reporting policy.
- Local diagnostic bundle contents.
- Redaction rules.
- Error visibility and state-safety checks.
- Support docs.

## Closeout

Closed with decision `0009`, `docs/diagnostics.md`, Preferences diagnostic
export, and `audits/AUDIT-2026-07-20-local-diagnostics.md`.

Stance:

- No telemetry.
- No automatic crash reporting.
- User-controlled local diagnostic export only.
- Display name and note text redacted unless the learner opts in.

Evidence: `20260720-225-local-diagnostics`,
`20260720-verification-remediation-225-308-309` (AC-4 content.revision).

## Verification amendment (2026-07-20)

Reopened briefly after source review: diagnostics lacked a content version.
Added deterministic `content.revision` fingerprint plus docs updates.
