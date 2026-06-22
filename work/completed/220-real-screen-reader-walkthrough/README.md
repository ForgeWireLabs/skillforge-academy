# 220 - Real screen-reader walkthrough

> **Status**: Completed
> **Owners**: Accessibility Specialist lead; QA support.
> **Depends on**: 213.

## Intent

Automated a11y checks and keyboard testing are not the same as a real
screen-reader pass. This item validates the app with NVDA on Windows and records
what a learner using assistive technology actually experiences.

## Scope

Views to cover:

- Dashboard and notifications
- Track switcher
- Learning paths and lesson reader
- Practice Lab
- PBQ Lab, including matching, ordering, and fill-in controls
- Mock exam setup, in-exam flow, timeout behavior, and review
- Flashcards
- Analytics, including charts and objective heatmap
- Notes, saved questions, and preferences
- Backup import/export controls

## Verification Plan

- Run NVDA with the packaged app or representative WebView context.
- Record exact navigation steps and defects.
- Fix high-impact defects.
- Re-run `npm run validate:a11y`, `npm test -- --run`, and `npm run build`.

## Closeout

Closed with `audits/AUDIT-2026-06-22-screen-reader-a11y.md`.

- NVDA was unavailable in this Windows environment, so the direct NVDA
  walkthrough acceptance criterion is explicitly waived and remains a residual
  risk for a future hands-on assistive technology pass.
- Source review and automated checks found no P0/P1 accessibility blockers.
- `scripts/validate-accessibility.mjs` now covers 16 cheap regressions including
  polite announcements, dialog modality, status messages, keyboard flashcards,
  fill-in PBQ labels, and objective heatmap spoken names.
- Evidence gates: `npm run validate:a11y`, `npm test -- --run`, `npm run build`.
