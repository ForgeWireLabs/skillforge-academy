# 221 - Cross-platform backup, import, and export hardening

> **Status**: Completed
> **Owners**: Data Migration Specialist lead; Mobile Specialist support.
> **Depends on**: 207, 217, 218.

## Intent

Backups are a learner-trust feature. Before mobile broadens the device matrix,
prove `.apexbackup` compatibility, failure handling, and transfer flows across
Windows, Android, and iOS.

## Scope

- Backup encryption/decryption fixtures.
- Schema migration through imported backups.
- Legacy JSON import compatibility.
- Wrong passphrase and corrupted file behavior.
- Platform file picker/share/export behavior.
- User recovery docs.

## Closeout

Closed with `audits/AUDIT-2026-06-22-cross-platform-backups.md`.

- `docs/backup-restore.md` defines Windows, Android, and iOS backup compatibility
  status, transfer behavior, failure messages, and recovery steps.
- `src/backup.ts` now rejects unsupported encrypted backup envelopes before they
  can be treated as legacy JSON.
- `src/backup.test.ts` covers representative learner state, legacy import and
  migration, malformed JSON, wrong passphrase, unsupported encrypted versions,
  and truncated encrypted payloads.
- Android validation remains blocked on `217`; iOS validation remains blocked on
  `218`.
- Evidence gates: `npm test -- --run`, `npm run validate:a11y`, `npm run build`.
