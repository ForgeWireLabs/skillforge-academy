# Certification Authoring Guide

SkillForge Academy certification tracks are data-first. A track should be added by creating a manifest entry and content banks, then running validation and build checks.

## Factory Workflow

```powershell
npm run scaffold:cert -- --id network-plus --prefix netplus --name "CompTIA Network+" --shortName "Network+" --exam N10-009 --examName "Network+"
npm run validate:content
npm run build
```

The scaffold command creates:

```text
src/content/<cert-id>/
|-- domains.json
|-- questions.json
|-- flashcards.json
|-- pbqs.json
`-- lessons.json
```

Replace scaffold starter content before shipping a real track.

## Manifest

Add one entry to `src/content/certifications.json`.

```json
{
  "id": "network-plus",
  "name": "CompTIA Network+",
  "shortName": "Network+",
  "vendor": "CompTIA",
  "idPrefix": "netplus",
  "description": "Networking certification track description.",
  "passThreshold": 0.75,
  "exams": [
    {
      "id": "N10-009",
      "certId": "network-plus",
      "name": "Network+",
      "defaultQuestions": 90,
      "defaultMinutes": 90
    }
  ]
}
```

Rules:

- `id` is kebab-case and matches the folder under `src/content/`.
- `idPrefix` is lowercase letters/numbers and prefixes every content ID. It must
  be **unique across tracks** — validation rejects a duplicate, since content ids
  from two tracks would otherwise collide.
- `vendor` is the certifying body (e.g. `"CompTIA"`, `"AWS"`, `"Microsoft"`,
  `"Cisco"`). It is data, not code — see [Other Vendors](#other-vendors-non-comptia-tracks).
- `passThreshold` is a fraction from `> 0` through `1`.
- Every exam object repeats the parent `certId`.
- Single-exam certs still use the same `exams` array shape.
- `order` (optional number) sets the track's position in the switcher and the
  all-tracks analytics overview. Tracks without an `order` sort after ordered
  ones, then alphabetically by name.
- `status` (optional) is `"available"` (default) or `"coming-soon"`.

## Track Availability ("coming soon")

A `"coming-soon"` track is advertised in the UI — it appears under a "Coming
soon" heading in the track switcher and as a roadmap row in the all-tracks
analytics overview — but it cannot be entered, and the required-bank rule does
not apply to it. This lets you publish the roadmap (e.g. an upcoming Network+
track) before any content is authored.

Scaffold a roadmap track with empty banks:

```powershell
npm run scaffold:cert -- --id security-plus --prefix secplus --name "CompTIA Security+" --shortName "Security+" --exam SY0-701 --status coming-soon --order 3
```

When the content is ready, author the banks and remove `"status": "coming-soon"`
(or set it to `"available"`); validation then enforces the required banks again.
The app guards `activeCertId`: if a learner's focused track is removed or flipped
to coming-soon, the workspace falls back to the first available track.

Before a track is published as current or objective-complete, add or refresh its
row in [Official Objective Drift Watch](objective-drift-watch.md). The checked
date, official source links, and next review date are part of the release
evidence, not optional notes.

## Other Vendors (Non-CompTIA Tracks)

The content model is **vendor-agnostic** — nothing in the app hardcodes CompTIA.
A track for any vendor (AWS, Microsoft, Cisco, Linux Foundation, …) is added the
same way, as data. No code changes are required.

- **Set the real vendor.** Pass `--vendor` to the scaffold (it defaults to
  `CompTIA`) or set `"vendor"` in the manifest. The track switcher, the all-tracks
  analytics overview, and the in-app **trademark disclaimer** all read `vendor`
  automatically and adjust their wording per track.
- **Pick a passing score.** `passThreshold` is a fraction. For vendors that
  publish a scaled score (e.g. a 700/1000 pass), convert it to the equivalent
  fraction (`0.70`). For a straight percentage, use it directly (e.g. `0.72`).
- **One or many exams.** Use one `exams` entry for a single-exam cert, or several
  (like A+'s two cores). `defaultQuestions`/`defaultMinutes` seed that exam's
  full-length mock.
- **Objectives are the vendor's.** The objective registry mirrors that vendor's
  official exam objectives — see [Objective Mapping](#objective-mapping-and-coverage).

Example — a non-CompTIA roadmap track scaffolded as coming-soon:

```powershell
npm run scaffold:cert -- --id aws-ccp --prefix awsccp --name "AWS Certified Cloud Practitioner" --shortName "Cloud Practitioner" --vendor "AWS" --exam CLF-C02 --passThreshold 0.70 --status coming-soon --order 4
```

Then author its banks and flip it to `available`. Everything else — per-track
progress, streaks, analytics, mock thresholds, search — works unchanged.

## Required Banks

Every `available` manifest cert must have non-empty:

- `domains.json`
- `questions.json`
- `flashcards.json`

Validation fails if any required bank is missing or empty for an available cert.
`coming-soon` tracks are exempt (see Track Availability above).

## Optional Banks

These may be absent or empty:

- `pbqs.json`
- `lessons.json`
- `objectives.json`

If present, they are fully validated.

## Objective Mapping And Coverage

Each track has an objective registry at `src/content/<cert>/objectives.json` —
the published exam objectives the curriculum is built against. Each entry:

```json
{
  "id": "secplus-1.4",
  "certId": "security-plus",
  "exam": "SY0-701",
  "domain": "secplus-architecture",
  "code": "1.4",
  "title": "Explain the importance of using appropriate cryptographic solutions",
  "verified": false
}
```

Rules:

- `id` is cert-prefixed and globally unique (A+ ids include the core, e.g. `aplus-c1-2.1`).
- `domain` and `exam` must belong to the same cert.
- `verified` records whether the objective number/title has been confirmed against
  the **vendor's official exam objectives** for that exam version (e.g. CompTIA's
  objectives PDF, an AWS exam guide). Registries are seeded from the public
  structure as `false`; confirm and flip to `true`.

Lessons, questions, flashcards, and PBQs may carry an optional `objectiveId` that
references a registry entry in the same track. The validator rejects any
`objectiveId` that does not resolve, **and requires the content item's `domain`
to match the referenced objective's `domain`** — so content is always filed under
the same domain the vendor assigns the objective. When you tag an item to an
objective, set its `domain` to that objective's domain too.

### Coverage

`npm run validate:content` prints an objective-coverage report. The **deep
target** is at least one lesson and at least six tagged questions per objective.
Run with `--strict-coverage` to fail the build on any gap:

```powershell
node scripts/validate-content.mjs --strict-coverage
```

Authoring an objective end to end means: write the lesson(s) that teach it, tag
them with its `objectiveId`, and tag (or author) at least six questions plus
flashcards/PBQs to the same `objectiveId`. See
`decisions/0006-objective-mapped-curriculum.md`.

## ID Rules

Every top-level content item ID starts with the cert's `idPrefix` plus `-`.

| Cert | Prefix | Example IDs |
| --- | --- | --- |
| A+ | `aplus` | `aplus-mobile`, `aplus-q001`, `aplus-f001` |
| Network+ | `netplus` | `netplus-networking`, `netplus-q001`, `netplus-f001` |
| Security+ | `secplus` | `secplus-threats`, `secplus-q001`, `secplus-f001` |

PBQ nested item IDs can be local to the PBQ. Top-level PBQ IDs still need the prefix.

## Domains

Domains drive learning paths, weighting, analytics, and mock-exam distribution.

Required fields:

- `id`
- `certId`
- `exam`
- `name`
- `weight`
- `color`
- `description`
- `topics`

Guidance:

- Use official objective domains as the structure, but write descriptions in original words.
- Weights should reflect the exam blueprint.
- Every question, PBQ, flashcard, and lesson must reference a domain belonging to the same cert.

## Questions

Required fields:

- `id`
- `certId`
- `exam`
- `domain`
- `difficulty`
- `prompt`
- `options`
- `answer`
- `explanation`
- `objective`

Quality rubric:

- Write original scenarios and explanations.
- Avoid recalled live exam questions or dumps.
- Make distractors plausible but not trick-based.
- Explanations should teach why the correct answer wins and, when helpful, why common alternatives fail.
- `answer` is a zero-based option index.
- `difficulty` must be `Foundation`, `Intermediate`, or `Advanced`.

## Flashcards

Required fields:

- `id`
- `certId`
- `domain`
- `front`
- `back`

Quality rubric:

- Favor active recall over passive definitions.
- Keep prompts short.
- Avoid cards that require multiple unrelated facts unless the concept is naturally grouped.

## PBQs

PBQs are optional. Supported types:

- `matching`: assign items to targets.
- `ordering`: sequence steps.

Quality rubric:

- Simulate technician tasks, not trivia.
- Keep nested item IDs unique within the PBQ.
- Include an explanation that teaches the pattern.

## Lessons

Lessons are currently structured reading content. The target architecture treats
courses, units, lessons, activities, and guided labs as first-class learning
content, with questions acting as assessment and reinforcement. See
`docs/course-lesson-content-model.md` before expanding lesson authoring.

Required fields:

- `id`
- `certId`
- `exam`
- `domain`
- `title`
- `order`
- `estMinutes`
- `objectives`
- `sections`

Each section requires `body` and may include:

- `heading`
- `bullets`
- `image`

Inline code spans use backticks in `body` and bullet text.

## Lesson Assets

Lesson images live under:

```text
public/lessons/<cert-id>/
```

In JSON, reference the path under `public/lessons/`:

```json
{
  "image": {
    "src": "network-plus/osi-model.svg",
    "alt": "Diagram of the seven OSI model layers.",
    "caption": "The OSI model organizes network functions into seven layers."
  }
}
```

Validation checks:

- Image path exists.
- `alt` text is present.
- `src` is non-empty.

## Pre-PR Checklist

- [ ] Content is original educational material.
- [ ] Required banks are present and non-empty.
- [ ] Every top-level content ID uses the cert prefix.
- [ ] Every `certId` matches the manifest.
- [ ] Every `exam` belongs to that cert.
- [ ] Every domain reference belongs to the same cert.
- [ ] Lesson images exist and include alt text.
- [ ] `npm run validate:content` passes.
- [ ] `npm run build` passes if app behavior or bundling changed.
