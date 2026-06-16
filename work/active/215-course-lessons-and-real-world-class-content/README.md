# 215 — Build course lessons and real-world class content

> **Status**: 📋 Active
> **Owners**: Content Specialist lead with Architect support.
> **Depends on**: 210, 214.

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
