# AUDIT-2026-06-22-screen-reader-a11y

## Summary

- **Type:** accessibility
- **Status:** passed-with-notes
- **Related work:** `220-real-screen-reader-walkthrough`
- **Date:** 2026-06-22
- **Reviewer:** Codex, Accessibility Specialist lane

## Scope

Reviewed the Windows desktop accessibility surface across navigation, dialogs,
track switcher, learning paths, practice, PBQ controls, mock exam flows,
flashcards, analytics, notes, preferences, and backup import/export controls.

## Assistive Technology Context

- NVDA: unavailable in this Windows environment (`Get-Command nvda` and running
  process checks found no local NVDA installation/session).
- WebView context: source-level review of the Tauri/React app plus automated
  accessibility validation.
- Result: the direct NVDA walkthrough requirement is waived for this closeout and
  recorded as a residual risk. The audit did not find P0/P1 accessibility
  blockers in the reviewed source paths.

## Evidence

- `npm run validate:a11y`
- `npm test -- --run`
- `npm run build`
- `scripts/validate-accessibility.mjs` now checks skip link, landmark target,
  polite view announcements, labelled primary navigation, current navigation
  state, Escape dismissal, visible focus styling, inert dialog background,
  return focus, dialog role/modal state, keyboard-dismissable track switcher,
  multi-select checkbox semantics, assistive-tech status messages, keyboard
  flashcards, labelled fill-in PBQ inputs, and objective heatmap spoken labels.

## Findings

No P0/P1 blockers were identified in the audited source. Existing affordances
cover labelled landmarks, focus restoration, modal semantics, keyboard card
activation, form labels for fill-in PBQs, spoken objective heatmap cells, and
status announcements for backup import/export feedback.

## Residual Risks

- A real NVDA run on the packaged Windows app is still needed before claiming
  first-hand screen-reader validation. This audit closes the current work item
  with an explicit environment waiver, not with a completed NVDA session.
- VoiceOver validation remains out of scope until iOS work item `218` produces a
  runnable target.

## Recommendation

Proceed with the current accessibility baseline. Re-run a true NVDA walkthrough
when NVDA is available, especially before broad public release or paid beta.
