# AUDIT-2026-06-30-objective-drift-watch

## Summary

- **Type:** content / release governance
- **Status:** passed-with-notes
- **Related work:** `223-official-objective-drift-watch`
- **Date:** 2026-06-30
- **Reviewer:** Codex, Content Specialist lane

## Scope

Created a repeatable objective-version watch process for shipped tracks:

- CompTIA A+ V15: `220-1201`, `220-1202`.
- CompTIA Network+: `N10-009`.
- CompTIA Security+: `SY0-701`.

The pass also added release-checklist integration and rules for relabeling
claims when objectives are superseded, retired, or replaced.

## Evidence

- `docs/objective-drift-watch.md` records official/source links, checked dates,
  next review dates, status vocabulary, release rules, and Security+ V8 draft
  watch.
- `docs/release-candidate-1.4.0.md` now requires the drift ledger check before
  current/objective-complete release claims.
- `docs/certification-authoring.md` now requires future tracks to add or refresh
  their drift ledger row before publication.
- `README.md` links objective currency claims to the drift ledger.

## Findings

### Addressed: no durable objective drift ledger

Before this work, the repo could validate objective coverage but had no durable
record of when official objective currency was last checked. The new ledger
creates a checked-date and next-review-date loop for every shipped track.

### Addressed: release claims lacked an explicit freshness gate

The release candidate checklist now requires a fresh drift-watch pass before
claiming tracks are current and objective-complete.

### Security+ V8 watch

Security+ remains `SY0-701` in the app. Security+ V8/SY0-801 is recorded as a
draft-watch signal only. The repo must not claim V8 coverage until official
CompTIA objectives are published and the content is reauthored or versioned.

## Residual Risks

- CompTIA pages and PDF download paths can move or require form-gated access,
  so future release passes must record source availability honestly.
- This audit establishes the watch process; it does not perform a line-by-line
  comparison against a newly downloaded objective PDF in source control.
- Security+ successor timing is uncertain, so its next review window is shorter
  than the other tracks.

## Recommendation

Proceed with current README/release claims as release-ready with notes. The
tracks remain tied to their named objective sets, and future releases now have a
specific freshness gate before repeating those claims.
