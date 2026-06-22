# 220 - Real screen-reader walkthrough

> **Status**: Active
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

Close when a dated accessibility audit exists, high-impact issues are fixed or
tracked, and residual risks are explicit.
