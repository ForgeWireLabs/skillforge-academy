# AUDIT-2026-06-17-security-plus-starter: Security+ Starter Track

Type: content / implementation
Status: passed-with-notes
Date: 2026-06-17
Auditor: Claude
Related Todo: `004`

## Scope

Implement work item `004` — add a minimal but real CompTIA Security+ (SY0-701)
starter track, confirming single-exam behavior with three tracks present.

## Context

`003` shipped the first additional track (Network+). Security+ is the planned
second expansion and the third track overall, which exercises the all-tracks
analytics overview and the track switcher with more than two entries.

## Method

Files added under `src/content/security-plus/`:

- `domains.json` — all five SY0-701 domains with exam-blueprint weights.
- `questions.json` — 18 original scenario questions (3-4 per domain, mixed difficulty).
- `flashcards.json` — 15 original cards (3 per domain).
- `lessons.json` — 2 lessons (CIA triad & controls; incident-response phases).
- `pbqs.json` — 2 PBQs (risk-strategy matching; IR-phase ordering).

Manifest: added the `security-plus` entry (`order: 3`, single exam `SY0-701`,
`passThreshold` 0.83).

Shared correction: set Network+ `passThreshold` from 0.75 to 0.80. The A+ value
of 0.75 derives from its official scaled passing score (675/900); applying the
same convention gives Network+ 720/900 = 0.80 and Security+ 750/900 ≈ 0.83. This
makes per-cert thresholds both distinct and defensible, and exercises the
per-cert mock pass line added in `001`.

Commands run:

```text
npm run scaffold:cert -- --id security-plus --prefix secplus ... --passThreshold 0.83
npm run validate:content
npm test -- --run
npm run build
npm run validate:a11y
```

## Findings

### AC: Security+ appears as a selectable track

Status: addressed. Three available tracks order A+ → Network+ → Security+
deterministically; the switcher exposes Security+ as selectable.

### AC: Security+ content validates

Status: addressed. `validate:content` reports `security-plus: 5 domains, 18
questions, 15 flashcards, 2 PBQs, 2 lessons` with no errors.

### AC: Practice, flashcards, learning path work

Status: addressed structurally. Every domain has ≥3 questions and ≥2 flashcards;
two domains carry lessons and the rest fall back to topic grids.

### AC: Mock exam uses manifest defaults and pass threshold

Status: addressed. The exam defaults (90 questions / 90 minutes) and the 0.83 pass
threshold flow from the manifest through `MockExam` and `scoreMock` (per-cert
threshold support is unit-tested in `logic.test.ts`).

### AC: A+, Network+, and Security+ progress remain isolated

Status: addressed. All Security+ ids are `secplus-` prefixed with `certId`
`security-plus`; validation enforces prefix and cross-cert scoping and rejects
duplicate ids, so each track's progress, analytics, bookmarks, cards, and attempts
stay filtered to their own cert.

### AC: No live exam dumps or proprietary content

Status: addressed. All content is original educational material covering standard
security fundamentals (CIA triad, control types, zero trust, threat actors,
malware, segmentation, IAM, incident response, risk strategies, governance).

## Evidence

```text
npm run validate:content
✓ Content valid: 3 certification(s), 19 domains, 169 questions, 66 flashcards, 12 PBQs, 40 lessons
  per cert -> a-plus: 9 domains, 133 questions, 36 flashcards, 8 PBQs, 36 lessons
  network-plus: 5 domains, 18 questions, 15 flashcards, 2 PBQs, 2 lessons
  security-plus: 5 domains, 18 questions, 15 flashcards, 2 PBQs, 2 lessons

npm test -- --run
Test Files  3 passed (3)
Tests       48 passed (48)

npm run build
✓ built

npm run validate:a11y
Accessibility validation passed (6 checks).
```

## Risks

- Starter sample, not full Security+ coverage — manifest description and docs label
  it as such.
- `npm run desktop:build` was not run; no Rust or bundling config changed.
- SY0-701 objectives can change; reconfirm the target exam before any full buildout.

## Final Status

Passed with notes. Work item `004` acceptance criteria are satisfied.
