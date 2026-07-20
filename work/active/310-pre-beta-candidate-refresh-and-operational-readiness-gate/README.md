# 310 — Pre-beta candidate refresh and operational readiness gate

> **Status**: Active
>
> Bounded gate before activating the real learner beta (`228`). Not a product
> feature pass.
> **Owners**: Steward / Release lead; Desktop, QA, and Accessibility Specialists
> support.
> **Depends on**: 219, 220, 221, 222, 225, 226, 227, 308, 309.

## Intent

The application is functionally ready enough to test with learners, but the
**artifact and pilot process are not yet pinned down**. Current `main` still
reports as `1.4.0` while carrying substantial Unreleased work since the June 22
RC, so a newly built installer is not uniquely identifiable against the audited
June artifact. Diagnostics fingerprint content revision, not application source
commit.

This item creates a uniquely identifiable beta candidate, freezes and validates
the exact Windows installer, records acceptance and CI evidence, decides the
NVDA/AT posture for the first cohort, and publishes a controlled pilot runbook.
Once green, `228` is the correct next item—no further product feature work
should be inserted between them.

## Out of scope

- Full line-by-line content review (calibration belongs to `228`).
- Additional certification tracks.
- Visual polish / P2–P3 UX follow-ups (useful as beta findings).
- iOS or Android inclusion in the first cohort.
- Public mass distribution or publisher reputation claims.
- Waiting on code signing (`212`) for a small private Windows beta.

## Decisions to make during this item

1. Exact prerelease version string (`1.4.1-beta.1` vs `1.5.0-beta.1`, etc.).
2. Whether diagnostics include an explicit `app.build` / commit field in addition
   to the unique version.
3. NVDA pass before invite **or** first beta explicitly not AT-qualified.
4. Stop-the-pilot conditions (suggested): lost/corrupted learner state; backup
   restore replacing good state unexpectedly; repeatable start failure; security
   or privacy exposure; demonstrably incorrect answer that damages trust; study
   flow blocker; serious accessibility trap for any included AT participant.

## Scope

- Version / identity surfaces (`package.json`, `VERSION`, Tauri, diagnostics).
- Frozen Windows installer + checksum / metadata record.
- Local + remote Windows gate evidence against the frozen commit.
- Packaged-app acceptance notes.
- Accessibility decision record (pass or controlled-beta exclusion).
- Pilot distribution / privacy / severity / stop-condition runbook.
- Governance: `228` dependency reconciliation, roadmap/audit pointers.

## Suggested packaged-app acceptance checklist

1. Clean install and SmartScreen path.
2. First-run tour.
3. Select A+, then switch to Network+ and Security+.
4. Open a lesson and mark progress.
5. Launch a domain-scoped Practice session.
6. Complete and review Practice.
7. Use every PBQ type.
8. Start and complete a short Mock exam.
9. Confirm weakest-domain remediation opens the correct drill.
10. Rate Recall cards.
11. Create a note and bookmark.
12. Close and reopen; verify persistence.
13. Export an encrypted backup.
14. Change learner state.
15. Import the backup and verify restoration.
16. Export diagnostics and verify version, build, content revision, redaction,
    and error context.
17. Uninstall/reinstall or upgrade and confirm data behavior.

## Closeout

Close when all acceptance criteria have evidence, the candidate artifact is
retained unchanged for pilot round one, and `228` is unblocked to activate.
Do not treat automated a11y validation as a substitute for the real NVDA
walkthrough unless AC-5 records an explicit non-AT-qualified cohort scope.
