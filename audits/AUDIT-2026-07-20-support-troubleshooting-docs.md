# AUDIT-2026-07-20-support-troubleshooting-docs: Support And Troubleshooting Documentation

Type: documentation / release support
Status: passed
Date: 2026-07-20
Auditor: Cursor agent
Related Todo: `226`

## Scope

Verify that SkillForge has a practical user-facing support guide covering
install/SmartScreen, launch, content loading, backup restore, data locations,
corrupted-state recovery, reset, diagnostics collection, and mobile notes, and
that README/release surfaces link to it.

## Context

Work item `226` depended on the `1.4.0` RC story (`219`), backup hardening
(`221`), and the diagnostics stance (`225`). Those are complete enough to
document verified behavior rather than aspirational recovery advice.

## Method

- Authored `docs/support-troubleshooting.md`.
- Cross-linked README installer and privacy sections, getting-started,
  backup-restore, diagnostics, and `docs/release-candidate-1.4.0.md`.
- Updated the backup compatibility matrix Android row to match `217` evidence.
- Ran RepoPact validate after closing the work item.

## Findings

### AC-1–AC-5

Status: satisfied.

The support guide covers the required desktop recovery paths, platform data
locations, diagnostics collection aligned with decision 0009, Android notes
from the `217` foundation, and an honest iOS blocked status for `218`. README
and RC release notes point users to the guide where install/recovery questions
arise.

## Evidence

See `evidence/runs/20260720-226-support-troubleshooting-docs.json`.

## Risks

- iOS end-user steps remain provisional until `218` runtime proof exists.
- Windows SmartScreen guidance will need a short update when `212` lands signed
  installers.

## Final Status

Passed. Work item `226` is complete.
