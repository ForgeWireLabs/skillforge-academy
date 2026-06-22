# Backup, Restore, And Cross-Device Transfer

SkillForge Academy stores learner data locally and exports portable backups as
`.apexbackup` files. Encrypted backups keep progress, notes, bookmarks,
settings, daily activity, attempt history, and flashcard scheduling together so
a learner can recover or move devices without a cloud account.

## Compatibility Matrix

| Platform | Local state | Encrypted `.apexbackup` export/import | Legacy JSON import | Status |
| --- | --- | --- | --- | --- |
| Windows desktop | `%APPDATA%\com.apexlearning.aplusacademy\learner-state.json` through the Tauri backend | Validated by unit tests and release smoke checks | Supported through `decryptBackup` plus `migrateState` | Supported in `1.4.0` |
| Android | Tauri app sandbox path to be finalized by `217` | Must use Android document/share APIs and preserve the same backup envelope | Must route imported JSON through the same migration path | Blocked on `217` |
| iOS | Tauri app container path to be finalized by `218` | Must use iOS document picker/share APIs and preserve the same backup envelope | Must route imported JSON through the same migration path | Blocked on `218` |

The encrypted backup envelope remains:

- Format: `apex-encrypted-backup`
- Version: `1`
- KDF: `PBKDF2-SHA256`
- Cipher: `AES-256-GCM`
- Minimum export passphrase length: 8 characters

## Export

1. Open **Preferences**.
2. Enter a backup passphrase with at least 8 characters.
3. Choose **Export Backup**.
4. Store the downloaded `.apexbackup` file somewhere separate from the app data
   directory.

The passphrase is not stored. Keep it with your recovery records; without it the
encrypted backup cannot be decrypted.

## Restore

1. Open **Preferences**.
2. Enter the backup passphrase.
3. Choose **Import Backup** and select the `.apexbackup` file.
4. Confirm that the dashboard, notes, saved questions, analytics, and flashcard
   queue reflect the restored data.

Legacy plain JSON backups can also be selected. They are imported through the
same migration path so older A+ item IDs, bookmarks, and flashcards are upgraded
to the current namespaced schema.

## Failure Handling

Import errors are designed to stop before replacing local learner data.

| Scenario | Expected message | Recovery |
| --- | --- | --- |
| Missing passphrase for encrypted backup | `Enter the backup passphrase.` | Re-enter the passphrase and import again. |
| Wrong passphrase, corrupted encrypted data, or partial file | `The passphrase is incorrect or the backup is damaged.` | Keep the current app data, find the original backup, and verify the passphrase. |
| Unsupported encrypted backup version or malformed envelope | `Unsupported or invalid encrypted backup format.` | Keep the original file and check whether it came from a newer app version. |
| Malformed JSON backup | `Backup file is not valid JSON.` | Re-export the backup from the source device if possible. |

Before attempting a risky restore, export a fresh backup from the current device.
If an import fails, do not uninstall or reset the app until the original backup
and passphrase have been verified.
