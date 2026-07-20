# 226 - Support and troubleshooting documentation

> **Status**: Completed
> **Owners**: Documentation lead; QA support.
> **Depends on**: 219, 221, 225.

## Intent

Make common support paths boring: install warnings, backup restore, state reset,
diagnostics, and recovery should be documented before users need to ask.

## Scope

- Install and SmartScreen troubleshooting.
- Backup/import/export recovery.
- Local data location and reset.
- Corrupted state recovery.
- Diagnostic bundle collection.
- Mobile support sections after 217/218.

## Closeout

Closed with `docs/support-troubleshooting.md` as the user-facing support hub,
linked from README (installer + privacy), getting-started, backup-restore,
diagnostics, the `1.4.0` RC checklist, and CHANGELOG Unreleased.

Android recovery notes reflect work item `217` emulator-validated behavior.
iOS remains honestly marked blocked on macOS/Xcode (`218`).

Evidence: `20260720-226-support-troubleshooting-docs`.
Audit: `audits/AUDIT-2026-07-20-support-troubleshooting-docs.md`.
