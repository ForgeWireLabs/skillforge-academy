---
id: 0005
title: "Adopt Course-First Content Architecture"
status: accepted
date: 2026-06-16
supersedes: []
---

# 0005: Adopt Course-First Content Architecture

## Context

SkillForge Academy has strong practice mechanics, but a certification academy
cannot rely on questions as the main teaching experience. Learners need lessons,
class structure, real-world examples, guided labs, vocabulary, and checks for
understanding before assessment.

## Decision

SkillForge Academy will treat courses, units, lessons, activities, and guided
labs as first-class content. Questions, flashcards, PBQs, and mock exams remain
the assessment and reinforcement layer attached to lessons and units.

The architecture target is the full course model across a certification track,
not a narrow pilot slice. Implementation may still be phased, but planning and
acceptance criteria must cover the complete learning experience.

## Alternatives considered

- **Keep lessons as optional prose attached to domains.** Rejected because it
  preserves the current quiz-first feel and does not support class-style
  learning, progress, labs, or instructional sequencing.
- **Add more questions and PBQs only.** Rejected because it improves assessment
  volume without solving the teaching gap.
- **Build one isolated pilot lesson before defining the model.** Rejected
  because it risks creating a local pattern that does not scale to all A+
  domains or future certifications.

## Consequences

- Content authoring must define full course structure, not only banks of
  assessment items.
- Validation must eventually cover course, unit, lesson, activity, and lab
  references.
- Learner state needs course progress in addition to assessment readiness.
- The Learn UI should become a course workspace rather than a simple lesson list.
- Full implementation requires migration care to preserve existing A+ progress
  and backups.
