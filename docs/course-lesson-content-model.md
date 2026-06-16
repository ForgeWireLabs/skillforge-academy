# SkillForge Academy Course And Lesson Content Model

**Status:** Target architecture  
**Date:** 2026-06-16  
**Related work:** `work/active/215-course-lessons-and-real-world-class-content/`

SkillForge Academy should behave like an offline certification academy. Practice
questions, flashcards, PBQs, and mock exams remain important, but they are the
assessment and reinforcement layer around a complete course experience.

This model defines the full target shape. It can be implemented in phases, but
the design target is the whole course, not a small pilot slice.

## Goals

1. Teach each certification as a complete course with domains, units, lessons,
   class activities, labs, and assessments.
2. Preserve the current content factory: adding a cert remains manifest plus
   per-cert content banks.
3. Keep all content original, objective-mapped, accessible, and offline-first.
4. Let learner progress show both learning completion and assessment readiness.
5. Keep A+ working end to end while the richer model is introduced.

## Content Hierarchy

```text
Certification
  Course
    Exam
      Domain
        Unit
          Lesson
            Sections
            Vocabulary
            Worked examples
            Real-world scenarios
            Checks for understanding
            Guided lab/PBQ hooks
            Linked practice
```

Recommended per-cert banks:

```text
src/content/<cert-id>/
|-- domains.json
|-- courses.json
|-- units.json
|-- lessons.json
|-- activities.json
|-- labs.json
|-- questions.json
|-- flashcards.json
`-- pbqs.json
```

## Target Types

```ts
export interface Course {
  id: string;
  certId: CertId;
  title: string;
  description: string;
  audience: string;
  outcomes: string[];
  estimatedHours: number;
  examIds: ExamId[];
  unitIds: string[];
}

export interface Unit {
  id: string;
  certId: CertId;
  exam: ExamId;
  domain: string;
  title: string;
  description: string;
  order: number;
  outcomes: string[];
  objectiveRefs: string[];
  lessonIds: string[];
  labIds: string[];
  reviewQuestionIds: string[];
}

export interface Lesson {
  id: string;
  certId: CertId;
  exam: ExamId;
  domain: string;
  unitId: string;
  title: string;
  summary: string;
  order: number;
  estMinutes: number;
  level: "Foundation" | "Intermediate" | "Advanced";
  objectives: string[];
  prerequisites: string[];
  outcomes: string[];
  sections: LessonSection[];
  vocabulary: VocabularyTerm[];
  examples: WorkedExample[];
  scenarios: RealWorldScenario[];
  checks: KnowledgeCheck[];
  linkedQuestionIds: string[];
  linkedFlashcardIds: string[];
  linkedPbqIds: string[];
  linkedLabIds: string[];
}
```

These types extend the current `Lesson` shape rather than replacing the product
surface in one jump.

## Lesson Sections

```ts
export type LessonSectionKind =
  | "concept"
  | "procedure"
  | "troubleshooting"
  | "field-note"
  | "exam-note"
  | "warning"
  | "summary";

export interface LessonSection {
  id: string;
  kind: LessonSectionKind;
  heading: string;
  body: string;
  bullets?: string[];
  steps?: string[];
  image?: LessonImage;
  relatedObjectiveRefs?: string[];
}
```

Section guidance:

- `concept`: explains what the topic is and why it matters.
- `procedure`: teaches a repeatable technician workflow.
- `troubleshooting`: maps symptoms to likely causes and next actions.
- `field-note`: connects exam content to support work.
- `exam-note`: explains how the idea is commonly assessed without recreating
  live exam content.
- `warning`: calls out safety, data loss, security, or accessibility concerns.
- `summary`: closes the lesson with key takeaways.

## Instructional Blocks

```ts
export interface VocabularyTerm {
  term: string;
  definition: string;
  firstUseSectionId?: string;
  linkedFlashcardId?: string;
}

export interface WorkedExample {
  id: string;
  title: string;
  setup: string;
  walkthrough: string[];
  takeaway: string;
  relatedQuestionIds?: string[];
}

export interface RealWorldScenario {
  id: string;
  title: string;
  role: "helpdesk" | "field-tech" | "bench-tech" | "admin";
  prompt: string;
  facts: string[];
  learnerTask: string;
  idealResponse: string;
  debrief: string;
  linkedPbqIds?: string[];
  linkedQuestionIds?: string[];
}
```

Scenarios should feel like tickets, work orders, technician observations, or user
reports. They should teach the next best action and separate known facts from
what the learner should investigate.

## Checks For Understanding

```ts
export type KnowledgeCheck =
  | MultipleChoiceCheck
  | ShortAnswerCheck
  | ClassificationCheck
  | OrderingCheck;

interface CheckBase {
  id: string;
  prompt: string;
  explanation: string;
  objectiveRefs: string[];
}

export interface MultipleChoiceCheck extends CheckBase {
  kind: "multiple-choice";
  options: string[];
  answer: number;
}

export interface ShortAnswerCheck extends CheckBase {
  kind: "short-answer";
  acceptableAnswers: string[];
}

export interface ClassificationCheck extends CheckBase {
  kind: "classification";
  items: { id: string; text: string }[];
  categories: { id: string; label: string }[];
  answer: Record<string, string>;
}

export interface OrderingCheck extends CheckBase {
  kind: "ordering";
  steps: { id: string; text: string }[];
  answer: string[];
}
```

Lesson checks are teaching interactions. They should not count as mock-exam
readiness unless promoted to the formal assessment bank.

## Guided Labs

```ts
export interface GuidedLab {
  id: string;
  certId: CertId;
  exam: ExamId;
  domain: string;
  unitId: string;
  title: string;
  scenario: string;
  estMinutes: number;
  objectives: string[];
  materials: string[];
  steps: LabStep[];
  successCriteria: string[];
  debrief: string;
  linkedPbqIds: string[];
  linkedQuestionIds: string[];
}

export interface LabStep {
  id: string;
  instruction: string;
  expectedObservation?: string;
  hint?: string;
}
```

Lab categories:

- Guided troubleshooting.
- Configuration walkthrough.
- Tool selection.
- Ticket triage.
- Symptom-to-cause mapping.
- Command or system-output interpretation.

## Assessment Links

Every teaching object should connect to reinforcement:

- Lesson to questions for immediate practice.
- Lesson to flashcards for retention.
- Lesson to PBQs for applied practice.
- Unit to review question set.
- Domain to mock readiness and mastery.

This prevents lessons and practice banks from drifting apart.

## Learner State

Current state tracks `lessonsRead: string[]`. The full model should expand this
without breaking existing saves.

```ts
export interface LessonProgress {
  openedAt: string;
  completedAt?: string;
  sectionIdsRead: string[];
  checkResults: Record<string, {
    attempts: number;
    correct: boolean;
    lastAnsweredAt: string;
  }>;
}

export interface UnitProgress {
  startedAt?: string;
  completedAt?: string;
  lessonIdsCompleted: string[];
  labIdsCompleted: string[];
}

export interface CourseProgress {
  activeUnitId?: string;
  lessonProgress: Record<string, LessonProgress>;
  unitProgress: Record<string, UnitProgress>;
  labProgress: Record<string, { completedAt?: string; attempts: number }>;
}
```

Migration rules:

- Existing `lessonsRead` becomes opened or completed lesson progress, depending
  on final UI behavior.
- Preserve `apex-state` and `.apexbackup` compatibility.
- Schema changes require migration tests.

## UI Model

The Learn view should become a course workspace:

- Course overview with domain and unit progress.
- Domain and exam filters.
- Unit list with completion state.
- Lesson reader with sections, vocabulary, examples, scenarios, checks, and
  linked practice.
- Lab view for guided technician tasks.
- Review panel for related flashcards, questions, and PBQs.

Dashboard and analytics should separate learning completion from assessment
readiness. A learner can finish lessons without being exam-ready, and a learner
can score well while still having incomplete course material.

## Validation Rules

Validation should eventually enforce:

- Course, unit, lesson, activity, lab, question, flashcard, and PBQ ids use the
  cert prefix.
- Every `certId` exists in the manifest.
- Every `exam` belongs to that cert.
- Every domain reference belongs to that cert.
- Every unit belongs to an existing domain.
- Every lesson belongs to an existing unit.
- Every linked question, flashcard, PBQ, and lab exists and belongs to the same
  cert.
- Every lesson has objectives, outcomes, sections, checks, and at least one
  reinforcement link.
- Images live under `public/lessons/<cert-id>/` and include useful alt text.

## Authoring Standards

Every full lesson should include:

- Plain-language explanation.
- Why the topic matters to a technician.
- At least one realistic scenario or worked example.
- A check for understanding.
- Links to reinforcement items.
- Objective references.
- Accessible media when media is used.

Every full unit should include:

- Outcomes.
- Ordered lessons.
- At least one review activity.
- Relevant labs or PBQs when the topic is procedural.
- A unit review set.

## Complete A+ Coverage Requirement

Work item 215 should not close when a single pilot lesson exists. It should close
when the full course model is documented, authoring standards are updated, app
changes are identified, and the A+ full-course buildout is either implemented or
split into explicit follow-up work items that cover the entire course.
