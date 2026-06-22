# AUDIT-2026-06-22-cross-platform-backups

## Summary

- **Type:** data migration / QA
- **Status:** passed-with-notes
- **Related work:** `221-cross-platform-backup-import-export-hardening`
- **Date:** 2026-06-22
- **Reviewer:** Codex, Data Migration Specialist lane

## Scope

Reviewed `.apexbackup` encryption/decryption, legacy JSON import compatibility,
schema migration after import, failure handling, and platform readiness for
Windows, Android, and iOS.

## Evidence

- `src/backup.test.ts` covers encrypted round-trip, representative multi-track
  learner state, legacy JSON import, legacy schema migration, passphrase minimum,
  malformed JSON, unsupported encrypted backup versions, wrong passphrase, and
  truncated encrypted data.
- `src/backup.ts` rejects encrypted-looking envelopes that do not match the
  supported format/version before they can be treated as plain legacy JSON.
- `docs/backup-restore.md` defines the Windows/Android/iOS compatibility matrix,
  restore instructions, cross-device transfer behavior, and recovery guidance.

## Findings

### Addressed: unsupported encrypted envelope fallback

Before this audit, an object with `format: "apex-encrypted-backup"` but an
unsupported version did not satisfy `isEncryptedBackup` and could be returned as
plain JSON. The importer now rejects that case with
`Unsupported or invalid encrypted backup format.`

### Addressed: failure-mode coverage

Tests now prove safe errors for malformed JSON, wrong passphrase, unsupported
version, and partial encrypted payloads. These errors reject before replacing
local learner state.

## Platform Status

| Platform | Result |
| --- | --- |
| Windows | Supported and test-covered for backup envelope compatibility. |
| Android | Blocked on `217` for the Tauri mobile app sandbox and document/share APIs. |
| iOS | Blocked on `218` for the Tauri mobile app container, picker/share APIs, and entitlements. |

## Residual Risks

- Android and iOS import/export behavior cannot be fully validated until `217`
  and `218` create runnable mobile targets.
- Future encrypted backup version bumps must add explicit migration tests before
  changing the envelope version.

## Recommendation

Proceed with the Windows backup baseline and carry the documented mobile
blockers into the Android/iOS implementation work.
