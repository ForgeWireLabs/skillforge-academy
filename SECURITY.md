# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting for this repository when available. If that option is unavailable, contact the repository owner privately through the account contact methods.

Include the affected version, reproduction steps, impact, and any suggested mitigation. Do not include real learner data, credentials, or other sensitive information.

## Supported versions

Security fixes are applied to the latest published release and the current main branch. Older releases may not receive backports.

## Local data

SkillForge Academy stores learner progress, notes, bookmarks, settings, and
scheduling data **on the device** under the application identifier
`com.apexlearning.aplusacademy` (Windows:
`%APPDATA%\com.apexlearning.aplusacademy\learner-state.json`). Local state is
**not** encrypted at rest by the application; protect the OS user profile or
device encryption. Reset from Preferences deletes local progress on that device.

## Backups

Portable `.apexbackup` files may contain the full learner profile. Prefer
passphrase-protected exports (PBKDF2-SHA256 + AES-256-GCM). Do not share backup
files or passphrases publicly. Import validates JSON, encrypted envelope
version, crypto parameters, and a size ceiling; failed imports do not overwrite
current progress. Details:
[docs/privacy-security.md](docs/privacy-security.md) and
[docs/backup-restore.md](docs/backup-restore.md).

## Telemetry and diagnostics

SkillForge Academy does not collect telemetry and does not upload crash reports.
Support uses an optional **local diagnostic export** from Preferences. By default
that export redacts display name and note text. See
[docs/diagnostics.md](docs/diagnostics.md) and
[decision 0009](decisions/0009-no-telemetry-local-diagnostic-export-only.md).

## Permissions

- **Desktop (Tauri):** `core:default` capability only; no shell/filesystem/opener
  plugins. Packaged WebView CSP restricts script and connect sources.
- **Android:** `INTERNET` for the WebView/Tauri runtime; FileProvider limited to
  `cache/backups/` for encrypted backup sharing. No broad storage permission for
  normal study data.
- **iOS:** Runtime permission review pending macOS/Xcode validation (`218`).

Full review notes: [docs/privacy-security.md](docs/privacy-security.md) and
[audits/AUDIT-2026-07-20-privacy-security.md](audits/AUDIT-2026-07-20-privacy-security.md).
