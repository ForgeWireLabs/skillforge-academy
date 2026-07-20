# Diagnostics And Error Reporting

SkillForge Academy is offline-first and private by design. It does **not** send
telemetry, crash reports, or learner activity to an external service.

When something goes wrong, support uses a **local diagnostic export** that you
create on demand. Nothing leaves your device unless you choose to share the file.
For broader install/backup/reset recovery steps, see
[Support And Troubleshooting](support-troubleshooting.md).

Product stance: [decision 0009](../decisions/0009-no-telemetry-local-diagnostic-export-only.md).

## What Is Included

A diagnostic file (`skillforge-diagnostic-YYYY-MM-DD.json`) contains:

| Section | Contents |
| --- | --- |
| Stance | Explicit `telemetry: none`, `crashReporting: none`, local-export-only |
| App | App version and learner-state schema version |
| Platform | Browser/WebView user agent, language, online flag, Tauri/Android bridge flags, viewport size |
| Content | Content revision fingerprint plus per-track counts of domains, questions, flashcards, PBQs, lessons, and objectives |
| State summary | Active track, theme, progress cadence metrics, attempt score summaries, and item counts |
| Recent errors | In-session support messages (save/load/backup failures), if any occurred |
| Redaction flags | Whether sensitive fields were included |

## What Is Redacted By Default

Unless you check **Include display name and note text**:

- Display name is omitted
- Note titles and bodies are omitted

Only counts remain for notes. Progress history summaries include scores and dates,
not free-form study notes.

## How To Collect Diagnostics

1. Open **Preferences**.
2. Find the **Diagnostics** card.
3. Leave the sensitive-content checkbox unchecked unless support specifically asks
   for note text.
4. Choose **Export diagnostics**.
5. Save the downloaded `.json` file.
6. Share that file through your normal support channel (email, private issue, etc.).

Also useful for support tickets:

- App version shown on the Preferences about card (and inside the diagnostic file)
- Content revision string inside the diagnostic file (`content.revision`) — a
  fingerprint of the loaded banks so support can confirm two installs share the
  same authored content set
- Operating system and whether you are on Windows desktop or Android
- Exact error text shown after a failed backup import/export
- Whether you can still open Command Center after the failure (state should remain intact)

## Failure Behavior

SkillForge prefers visible, recoverable errors over silent data loss:

| Situation | What you should see | State safety |
| --- | --- | --- |
| Encrypted backup export fails (short passphrase, crypto error) | Status message under Encrypted backup | Current progress unchanged |
| Backup import fails (wrong passphrase, damaged file, bad JSON) | Status message under Encrypted backup | Current progress unchanged; import does not replace state |
| Local save/load hiccup | App continues with the durable fallback path | `migrateState` tolerates malformed fields; diagnostics can record the error for the session |
| Missing content bank for a track | Empty-state messaging in that view | Other tracks and existing progress remain usable |

Before risky restore or reset steps, export a fresh encrypted backup from
Preferences. See [Backup, Restore, And Cross-Device Transfer](backup-restore.md).

## What This Is Not

- Not a cloud account
- Not automatic log upload
- Not a substitute for encrypted `.apexbackup` files (use backups to move or
  recover progress; use diagnostics to explain a failure)
