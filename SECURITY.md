# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting for this repository when available. If that option is unavailable, contact the repository owner privately through the account contact methods.

Include the affected version, reproduction steps, impact, and any suggested mitigation. Do not include real learner data, credentials, or other sensitive information.

## Supported versions

Security fixes are applied to the latest published release and the current main branch. Older releases may not receive backports.

## Local data

SkillForge Academy stores learner data locally. Backups may contain study history, notes, bookmarks, settings, and scheduling data. Use passphrase-protected backups for transfer and avoid sharing exported data publicly.

## Telemetry and diagnostics

SkillForge Academy does not collect telemetry and does not upload crash reports.
Support uses an optional **local diagnostic export** from Preferences. By default
that export redacts display name and note text. See
[docs/diagnostics.md](docs/diagnostics.md) and
[decision 0009](decisions/0009-no-telemetry-local-diagnostic-export-only.md).
