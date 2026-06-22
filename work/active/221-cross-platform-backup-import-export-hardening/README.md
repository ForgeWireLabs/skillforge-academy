# 221 - Cross-platform backup, import, and export hardening

> **Status**: Active
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

Close when compatibility is proven with tests and platform evidence, and when a
learner can follow documented recovery steps without guessing.
