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
- `idPrefix` is lowercase letters/numbers and prefixes every content ID.
- `passThreshold` is a fraction from `> 0` through `1`.
- Every exam object repeats the parent `certId`.
- Single-exam certs still use the same `exams` array shape.

## Required Banks

Every manifest cert must have non-empty:

- `domains.json`
- `questions.json`
- `flashcards.json`

Validation fails if any required bank is missing or empty for a cert.

## Optional Banks

These may be absent or empty:

- `pbqs.json`
- `lessons.json`

If present, they are fully validated.

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
