# AUDIT-2026-07-20-privacy-security: Privacy And Security Review

Type: security / privacy
Status: passed-with-notes
Date: 2026-07-20
Auditor: Cursor agent
Related Todo: `227`

## Scope

Focused review of backup cryptography, local state storage/reset, import
validation, Tauri/mobile permissions, diagnostic privacy, and user-facing
security documentation for SkillForge Academy.

## Context

Depends on passphrase backups (`207`), Android foundation (`217`), iOS foundation
status (`218`), backup hardening (`221`), and diagnostics stance (`225`).

## Method

- Reviewed `src/backup.ts`, `src/App.tsx` import/export paths, `src/diagnostics.ts`.
- Reviewed `src-tauri/src/lib.rs`, `capabilities/default.json`, `tauri.conf.json`.
- Reviewed Android `AndroidManifest.xml`, `file_paths.xml`, `MainActivity.kt`
  share bridge.
- Applied hardening fixes and expanded automated backup tests.
- Regenerated RepoPact dashboard and validated governance records.

## Findings

### Fixed P1: unused opener capability surface

Status: fixed.

`tauri-plugin-opener` and `opener:default` were enabled while the frontend never
called opener APIs. Removed the plugin dependency and narrowed the desktop
capability to `core:default`.

### Fixed P1: null CSP

Status: fixed.

Packaged WebView CSP was `null`. Set a restrictive CSP allowing self assets,
Tauri IPC, and inline styles required by the UI, while blocking objects and
framing.

### Fixed P1: missing size / KDF DoS guards on backup import

Status: fixed.

Decrypt/import now rejects payloads over 5 MiB, iteration counts outside
100k–500k, and salt/IV lengths other than 16/12 bytes. Rust `import_state` /
`save_state` / `load_state` enforce the same size ceiling. Android share bridge
rejects oversized payloads. Preferences checks `file.size` before reading.

### Fixed P2: unused `export_state` IPC command

Status: fixed.

Removed the unused command that returned raw on-disk state JSON through IPC.

### Accepted residual: plaintext local state

Status: accepted residual risk.

`learner-state.json` / WebView `apex-state` remain unencrypted at rest. OS
profile/device encryption is the confidentiality boundary. Documented in
`docs/privacy-security.md` and `SECURITY.md`.

### Accepted residual: iOS runtime not validated

Status: accepted residual / blocked dependency.

iOS permission and backup handoff remain blocked on macOS/Xcode (`218`). Docs
state this honestly.

### Accepted residual: unsigned Windows installer

Status: accepted residual / blocked dependency.

Code signing remains `212`. SmartScreen warning documented.

## Evidence

See `evidence/runs/20260720-227-privacy-security.json`.

## Release recommendation

**Continue `1.4.0` RC** with the hardening in this audit. Do not market
at-rest encryption or signed installers until those land. Proceed with learner
beta (`228`) under the documented privacy stance.

## Final Status

Passed-with-notes. Work item `227` is complete.
