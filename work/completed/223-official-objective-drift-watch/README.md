# 223 - Official certification objective drift watch

> **Status**: Completed
> **Owners**: Content Specialist lead; Steward support.
> **Depends on**: 214, 304, 305.

## Intent

The app claims current, objective-complete tracks. That claim decays whenever a
vendor publishes drafts, retires exams, or updates objectives. This item creates
a durable watch process so future releases do not accidentally overstate
currency.

## Scope

- Official objective source ledger.
- Checked dates and next review dates.
- Retirement/draft-successor tracking.
- Release checklist integration.
- Rules for relabeling stale tracks.

## Closeout

Close when the repo has a clear, repeatable objective-drift process and current
evidence for each shipped track.

## Closeout Evidence

Completed 2026-06-30.

- Added `docs/objective-drift-watch.md` with the repeatable process, source
  ledger, checked dates, next review dates, status vocabulary, release rules,
  and Security+ V8 draft watch.
- Added `audits/AUDIT-2026-06-30-objective-drift-watch.md`.
- Added `evidence/runs/20260630-223-objective-drift-watch.json`.
- Updated `docs/release-candidate-1.4.0.md` so objective drift freshness is a
  release gate.
- Updated `docs/certification-authoring.md` so future tracks must add or refresh
  a drift-watch row before publication.
- Updated `README.md` to link objective-complete claims to the drift ledger.

Validation:

- `node scripts/validate-content.mjs --strict-coverage` passed.
- `npm run validate:content` passed.
- `npm test -- --run` passed.
- `python -m repopact_cli validate` still fails on the repo-wide
  preflight-marker requirement affecting existing work items.
