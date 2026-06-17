# 215 — Build course lessons and real-world class content

> **Status**: 🚧 In progress
> **Owners**: Content Specialist lead with Architect support.
> **Depends on**: 210, 214.
>
> **2026-06-17 — Phase 1 (objective-mapped backbone) landed.** Per
> `decisions/0006-objective-mapped-curriculum.md`, each track now has an objective
> registry (`src/content/<cert>/objectives.json`) covering all published
> sub-objectives (A+ 63, Network+ 24, Security+ 28 = 115 total, seeded
> `verified:false` pending official-PDF confirmation). Content items can carry an
> `objectiveId`; validation rejects bad references and reports per-objective
> coverage against the deep target (>=1 lesson + >=6 questions), with
> `--strict-coverage` to gate. First objective completed end-to-end as the
> template: `secplus-1.4` (1 lesson + 7 questions tagged).
>
> **Phase 2 (ongoing):** author/tag lessons + >=6 questions per objective across
> all sub-objectives.
>
> - **2026-06-17 — objective lists verified** against official CompTIA objectives
>   PDFs (pdfplumber). Network+ gained 2.4; A+ rebuilt to V15. 116 verified
>   sub-objectives (A+ 63, Network+ 25, Security+ 28).
> - **2026-06-17 — Phase 2 batches 1-5: Security+ 100% objective-complete**
>   (28/28 objectives, all to deep target). Security+ now 193 questions / 41
>   lessons. Overall objective coverage **28/116**.
>
> Cadence: author domain by domain, commit per domain, watch the coverage report.
> **Next:** Network+ (25 objectives), then A+ (63). Note for those tracks: some
> existing content lives in a different content-domain than where CompTIA places
> the objective (e.g., cabling/media authored under "implementation" but objective
> 1.5 is in "Networking Concepts"). Objective tags may cross content-domains
> (validator allows it; only cert must match), or re-domain as needed.

## Intent

SkillForge Academy must become a real certification learning environment, not just
a study-question app. This work item defines the full class-style learning
system where lessons, examples, field scenarios, and guided labs teach concepts
before practice questions assess them.

The first implementation target is the complete A+ course, because it is the
trust anchor for the platform. The model should also fit future Network+ and
Security+ tracks.

## Problem

The current product has strong practice mechanics, but the learner experience can
still feel too close to quiz prep. Real learners need structured instruction:
what a concept means, how it appears in the field, how to diagnose issues, and
why an answer is correct before they are repeatedly assessed.

Questions, flashcards, PBQs, and mock exams should become the assessment and
reinforcement layer around a broader course experience.

## Scope

In scope:

- Define a course/unit/lesson model compatible with the multi-cert content
  factory.
- Design the complete A+ course architecture with class-style lessons across all
  A+ domains.
- Include real-world troubleshooting scenarios, helpdesk-style tickets, guided
  examples, vocabulary support, and checks for understanding.
- Connect lessons to related questions, flashcards, PBQs, domains, objectives,
  and readiness reporting.
- Define authoring standards for original content, accessibility, useful image
  alt text, objective mapping, and `certId`/id-prefix rules.
- Identify needed app UI and learner-state changes for lesson browsing,
  completion, and progress.

Out of scope for this architecture pass:

- Importing copyrighted courseware, exam dumps, recalled live exam questions, or
  proprietary assessment content.
- Replacing the existing practice, flashcard, PBQ, and mock exam systems.

## Course Shape

The target learner flow should look like a course:

1. Course overview
2. Domains
3. Units
4. Lessons
5. Checks for understanding
6. Guided labs and PBQs
7. Practice questions
8. Review and readiness

## Full-Course Coverage

The A+ course architecture must cover every domain, with extra attention to
areas where real-world understanding matters more than memorization:

- Hardware troubleshooting
- Networking fundamentals and connectivity troubleshooting
- Operating system support workflows
- Printer and peripheral troubleshooting
- Security basics for support technicians

## Decisions

- Treat questions as assessment and reinforcement, not as the primary teaching
  artifact.
- Design for the whole A+ course before broadening to new certifications.
- Preserve content originality and avoid any live exam reconstruction.
- Use `docs/course-lesson-content-model.md` as the target architecture.
- Follow decision `0005-adopt-course-first-content-architecture`.

Promote durable architecture decisions from this work item into `decisions/`
when the lesson model is selected.

## Acceptance Criteria

- AC-1: Define a course content model that treats questions as assessment, not
  the primary lesson experience.
- AC-2: Draft the complete A+ course architecture with domains, units,
  class-style lessons, real-world scenarios, checks for understanding, labs,
  review paths, and PBQ tie-ins.
- AC-3: Document authoring standards for original lesson content, field
  relevance, accessibility, objective mapping, and cert-id/id-prefix
  requirements.
- AC-4: Identify required app changes for browsing lessons, tracking lesson
  completion, and connecting lessons to practice questions, labs, flashcards,
  and mock readiness.

## Evidence Plan

- Architecture/content model document or decision record.
- Complete A+ course map or full-course implementation plan.
- Updated content authoring guidance.
- Validation or build evidence once implementation begins.

Current evidence:

- `docs/course-lesson-content-model.md`
- `docs/a-plus-complete-course-map.md`
- `decisions/0005-adopt-course-first-content-architecture.md`
- `docs/certification-authoring.md`

## Closeout

Each acceptance criterion must have linked evidence before this item can move to
`work/completed/`. If implementation is split, follow-up work items must cover
the whole course rather than only a single pilot slice.
