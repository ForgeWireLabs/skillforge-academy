# Pilot Runbook — SkillForge Academy 1.4.1-beta.1

Related work: `310` (gate), `228` (learner loop). Candidate metadata:
[beta-candidate-1.4.1-beta.1.md](beta-candidate-1.4.1-beta.1.md).

## Cohort boundary

- Platform: Windows 10/11 x64 only for this round
- Size: small invited cohort (about 3–6 known testers)
- Distribution: direct supply of the frozen installer + SHA-256
- Installer is **unsigned** — expect SmartScreen / unrecognized publisher
- No public mass-distribution claim; no Windows publisher reputation expectation
- Android / iOS not included
- **Assistive technology:** this first cohort is **not yet AT-qualified**. Do not
  recruit NVDA/VoiceOver-dependent participants until a real screen-reader pass
  is recorded (WI 220 residual / ROADMAP). Automated a11y checks are not a
  substitute.

## SmartScreen guidance (testers)

1. Run the supplied `.exe`.
2. If SmartScreen appears: **More info → Run anyway**.
3. Confirm the file hash matches `SHA256SUMS.txt` before running if practical.
4. Do not download alternate copies from the open web for this round.

## Consent and privacy

- Participation is voluntary; stop anytime.
- Progress stays local on the tester device (offline-first; no telemetry).
- Diagnostic exports are **optional**. If shared, prefer the default redacted
  export unless support asks otherwise.
- Do **not** include real passwords, API keys, unrelated personal documents, or
  third-party credentials in feedback or diagnostic attachments.
- Feedback is used only to improve SkillForge and triage defects.

## Support channel

Use the private channel designated by the Steward for this pilot (email or
private issue tracker). Include:

- App version (`1.4.1-beta.1`)
- Build ID (`app.build`, e.g. `ca6d5b6`)
- `content.revision` from diagnostics when available
- Track / exam / domain
- Exact question or UI wording when relevant
- Severity (see below)
- Whether the issue is a product defect or incorrect/ambiguous educational content

## Severity definitions

| Severity | Meaning |
| --- | --- |
| S0 | Stop-the-pilot condition (see below) |
| S1 | Blocks ordinary study for this tester |
| S2 | Major friction; workaround exists |
| S3 | Minor UX / polish / content wording |
| S4 | Idea / future enhancement |

## Stop-the-pilot conditions

Pause the pilot immediately and notify the Steward if any participant reports:

- Lost or corrupted learner state
- Backup restoration replacing good state unexpectedly
- Repeatable application-start failure
- A security or privacy exposure
- A question with a demonstrably incorrect answer that materially damages trust
- A flow blocker preventing ordinary study
- A serious accessibility trap for any included AT participant (none planned this round)

## Known limitations

- Unsigned Windows installer / SmartScreen warning
- GitHub Actions Windows gate currently blocked by account billing lock
- Real NVDA walkthrough still outstanding
- Remaining P2/P3 UX polish items may surface as feedback (not blockers)

## Feedback form fields (minimum)

1. Tester ID / handle
2. Exact installer SHA-256 used
3. `app.version` / `app.build` / `content.revision`
4. Track, exam, domain (and question wording if assessment-related)
5. Scenario completed from the participant script
6. Install friction / study clarity / content trust / difficulty / a11y /
   performance / backup confidence / willingness to keep using
7. Defect vs content issue
8. Severity
9. Steps to reproduce
10. Optional: diagnostic filename shared

## Participant script (summary)

Install the exact candidate → pick a track → study ≥30 minutes → practice →
lessons/flashcards → PBQ Lab → start/complete a mock → backup → restore if
practical → report using the fields above.

Full loop ownership remains WI `228` once this gate is green.
