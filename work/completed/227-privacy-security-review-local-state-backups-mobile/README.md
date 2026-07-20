# 227 - Privacy and security review for local state, backups, and mobile

> **Status**: Completed
> **Owners**: Security/Privacy Specialist lead; Desktop and Mobile Specialists support.
> **Depends on**: 207, 217, 218, 221, 225.

## Intent

The app asks learners to trust it with progress, notes, and encrypted backups.
This item performs a focused privacy/security review across local state,
backup/import, diagnostics, Tauri permissions, and mobile platform behavior.

## Scope

- Backup cryptography and format behavior.
- Local state storage and reset behavior.
- Malformed/imported data handling.
- Tauri desktop and mobile permissions.
- Diagnostic privacy.
- SECURITY/privacy documentation.

## Closeout

Closed with `audits/AUDIT-2026-07-20-privacy-security.md` and
`docs/privacy-security.md`.

Hardening shipped:

- Backup/state 5 MiB ceilings; iteration and salt/IV checks.
- Removed unused `opener` plugin and `export_state` command.
- Packaged WebView CSP enabled.
- Android share bridge size guard.
- SECURITY.md and privacy docs updated.

Evidence: `20260720-227-privacy-security`.
