# Official Objective Drift Watch

SkillForge Academy claims objective-complete coverage for shipped certification
tracks. That claim is time-sensitive. Use this watch before release candidates,
new track publication, and any user-facing claim that a track is current.

Checked date for this ledger: 2026-06-30.

## Repeatable Process

1. Open the vendor certification page and the vendor objective download/source.
2. Confirm the live exam code(s), objective version, publish/retirement signals,
   and any successor or draft-successor language.
3. Compare the vendor objective count/domain list with
   `src/content/<cert-id>/objectives.json`.
4. Run `node scripts/validate-content.mjs --strict-coverage`.
5. Update this ledger with checked date, next review date, links, and status.
6. If drift is detected, update claims before release:
   - `README.md` certification table and project status.
   - `docs/release-candidate-*.md` release scope and gates.
   - `src/content/certifications.json` descriptions if "current" or
     "objective-complete" would become misleading.
   - Any screenshots, release notes, or app copy that names the old objective
     set as current.
7. If a shipped track is superseded but still useful, relabel it as archived or
   previous-objective coverage until the new objective set is authored and
   validated.

Future tracks must add one row to the ledger before release.

## Current Ledger

| Track | App exam/objective set | Official/source links | Checked | Next review | Drift status | Retirement/successor signal |
| --- | --- | --- | --- | --- | --- | --- |
| CompTIA A+ | V15, Core 1 `220-1201`, Core 2 `220-1202` | [CompTIA A+ certification page](https://www.comptia.org/en-us/certifications/a/); [CompTIA exam objectives resource hub](https://partners.comptia.org/resources/official-comptia-content/exam-objectives) | 2026-06-30 | 2026-09-30 | No drift recorded for the app's V15 target. | Watch for a 220-130x successor or a published 220-120x retirement date. |
| CompTIA Network+ | `N10-009` | [CompTIA Network+ certification page](https://www.comptia.org/en-us/certifications/network/); [CompTIA exam objectives resource hub](https://partners.comptia.org/resources/official-comptia-content/exam-objectives) | 2026-06-30 | 2026-09-30 | No drift recorded for N10-009. | Watch for an N10-010 successor or an N10-009 retirement date. |
| CompTIA Security+ | `SY0-701` | [CompTIA Security+ certification page](https://www.comptia.org/en-us/certifications/security/); [CompTIA exam objectives resource hub](https://partners.comptia.org/resources/official-comptia-content/exam-objectives) | 2026-06-30 | 2026-08-31 | No drift recorded for SY0-701; higher-frequency watch due to successor chatter. | Security+ V8/SY0-801 is a draft-watch item only; no repo content should claim V8 coverage until CompTIA publishes official objectives and the track is reauthored. |

## Status Vocabulary

- **No drift recorded:** shipped content still matches the objective set named in
  app/docs based on the latest watch pass.
- **Draft watch:** unofficial or draft-successor signal exists, but the current
  objective set remains the public release target.
- **Superseded:** vendor has published a successor objective set; claims must be
  relabeled until content is updated.
- **Retired:** vendor no longer offers the exam; the track may remain as archive
  training, but release/docs must not call it current.

## Release Rules

Do not publish a release candidate as "current" or "objective-complete" unless
this ledger has been checked within the previous 90 days. Security+ successor
watch should be refreshed within 60 days until a post-SY0-701 objective set is
publicly resolved.

If official pages are unavailable during a release pass, record the outage in
the audit and use the latest cached/objective artifact only as provisional
evidence. The release recommendation should be "passed-with-notes" or blocked,
depending on how stale the last confirmed check is.

## Security+ V8 Draft Watch

As of 2026-06-30, SkillForge Academy ships Security+ `SY0-701` only. Treat any
Security+ V8/SY0-801 discussion as a watch signal, not a content target, until
CompTIA publishes official objective documents. When official V8 objectives
appear:

1. Create a new work item for Security+ successor analysis.
2. Compare domains/objectives against `src/content/security-plus/objectives.json`.
3. Decide whether to update the existing `security-plus` track or add a
   versioned successor track.
4. Update README/release claims before saying Security+ is current for V8.
