# Privacy And Security

How SkillForge Academy handles learner data, backups, diagnostics, and platform
permissions. This complements the vulnerability-reporting policy in
[SECURITY.md](../SECURITY.md).

Product stance on telemetry: [decision 0009](../decisions/0009-no-telemetry-local-diagnostic-export-only.md).

## Summary

| Topic | Stance |
| --- | --- |
| Accounts / cloud sync | None. Offline-first; no required account. |
| Telemetry / crash upload | None. |
| Local learner state | Stored on-device in app-private locations as JSON. Not encrypted at rest by the app; rely on OS user-profile / device encryption. |
| Portable backups | Optional passphrase-protected `.apexbackup` (PBKDF2-SHA256 + AES-256-GCM). |
| Diagnostics | Local export only; display name and notes redacted by default. |
| Network | Desktop builds do not need network for study. Android declares `INTERNET` for the WebView/Tauri stack; the product does not phone home. |

## Local learner state

| Platform | Location | Confidentiality expectation |
| --- | --- | --- |
| Windows | `%APPDATA%\com.apexlearning.aplusacademy\learner-state.json` | Protected by the Windows user profile. Other local accounts and malware with user rights can read it. |
| Android | App-private WebView `apex-state` plus best-effort Rust sandbox mirror | Private to the app UID unless the device is rooted or a backup/share intentionally exports data. |
| iOS | Designed as app-container state via Tauri `app_data_dir` | Private app container once runtime-validated (`218` still blocked). |

Atomic save uses a temp file + rename on the Rust path. Reset deletes the state
file (and clears in-app state). Import failures do not replace current progress.

Compatibility anchors: application id `com.apexlearning.aplusacademy`,
`apex-state` key, `.apexbackup` extension.

## Backup cryptography

Encrypted portable backups use:

- Format id: `apex-encrypted-backup` version `1`
- KDF: PBKDF2-SHA256 with **210,000** iterations (import accepts 100,000–500,000)
- Salt: 16 random bytes
- Cipher: AES-256-GCM with 12-byte IV
- Minimum passphrase length: 8 characters
- Soft size ceiling: **5 MiB** for import/export payloads

Authentication failures (wrong passphrase, truncated ciphertext, wrong salt/IV
length) surface as a generic incorrect/damaged error and do not replace local
state. Unsupported format versions are rejected before legacy JSON fallback.

Legacy plain JSON backups remain importable for upgrade compatibility; treat
them as sensitive if they contain notes.

## Diagnostics privacy

Diagnostic exports are user-initiated files. By default they omit display name
and note text. Recent errors are in-memory for the session only. See
[diagnostics.md](diagnostics.md).

## Tauri capabilities and mobile permissions

Desktop capability (`src-tauri/capabilities/default.json`) grants
`core:default` only. The unused `opener` plugin was removed so the WebView
cannot open arbitrary OS URLs or reveal filesystem paths through that IPC
surface. Custom commands are limited to load/save/import/reset state and load
bundled content, with a 5 MiB soft ceiling on state payloads.

CSP is set in `tauri.conf.json` to restrict script/connect/object sources for
the packaged WebView (IPC allowed for Tauri).

Android:

- `INTERNET` — declared for the WebView/Tauri runtime; not used for SkillForge
  analytics or account APIs.
- FileProvider scoped to `cache/backups/` only for encrypted backup share
  handoff (`exported=false`, grant URI permissions for the share Intent).
- Share bridge sanitizes filenames and rejects oversized payloads.

iOS runtime permissions will be reviewed when `218` unblocks on macOS/Xcode.

## Residual risks

- Local state JSON is readable to anyone with access to the unlocked user
  profile or a rooted/jailbroken device.
- Short passphrases remain user-chosen; 8 characters is a floor, not a strong
  password policy.
- Unsigned Windows installers still trigger SmartScreen (`212`).
- iOS backup/document handoff is not runtime-validated yet (`218`).

## Release recommendation

Accept for continued `1.4.0` RC use after this review’s hardening (CSP, capability
narrowing, backup/state size and crypto-parameter checks). Do not claim
end-to-end encrypted local storage or signed installers until those items land.
