# TODO-002: Certification Authoring Guide And Quality Rubric

Status: ready  
Priority: P1  
Area: Content Platform / Documentation  
Owner: Unassigned  
Created: 2026-06-16  
Updated: 2026-06-16  
Related: `docs/multi-certification-plan.md`, `todos/TODO-001-true-cert-factory.md`

## Problem

The multi-certification plan defines the technical shape of certification content, but there is no complete authoring guide for humans or agents adding a new track. Without a guide, Network+ and Security+ content will likely drift in ID format, objective mapping, lesson structure, explanations, validation expectations, and originality standards.

## Desired Outcome

Create a durable certification authoring guide that explains exactly how to add and maintain a certification track after the factory mechanics exist.

The guide should let a future agent add a new certification without rediscovering:

- Manifest fields.
- Required and optional bank files.
- ID prefix rules.
- Domain/exam/objective mapping.
- Lesson format and image asset requirements.
- Question/PBQ/flashcard quality standards.
- Validation commands.
- Content originality rules.

## Scope

### In Scope

- Add a guide under `docs/`, for example `docs/certification-authoring.md`.
- Document required banks: `domains.json`, `questions.json`, `flashcards.json`.
- Document optional banks: `pbqs.json`, `lessons.json`.
- Document optional lesson assets under `public/lessons/<cert-id>/`.
- Define minimum viable seed content for a new track.
- Define quality rubric for questions, explanations, flashcards, lessons, and PBQs.
- Define examples for CompTIA-style single-exam and multi-exam certifications.
- Link from `README.md`, `CONTRIBUTING.md`, or `ROADMAP.md` where appropriate.

### Out Of Scope

- Implementing the factory loader itself.
- Writing full Network+ or Security+ banks.
- Changing validation logic beyond documentation.

## Acceptance Criteria

- A new authoring guide exists in `docs/`.
- The guide includes a complete per-file schema overview.
- The guide includes ID examples for `a-plus`, `network-plus`, and `security-plus`.
- The guide explains required vs optional files.
- The guide explains how lesson image paths and alt text are validated.
- The guide includes a content originality policy.
- The guide includes a pre-PR checklist.
- Existing contributor docs link to it.

## Verification Plan

Run:

```powershell
npm run validate:content
```

If docs links or README sections are edited, manually inspect the rendered markdown in the changed files.

## Risks

- If this guide is created before `TODO-001`, it may need updates once the final factory mechanics are implemented.
- A guide that is too vague will not prevent content drift; include concrete examples.

## Progress Log

- 2026-06-16: Todo created to support Phase 3 content expansion.

## Follow-Up Candidates

- Add JSON schema files for content banks.
- Add a content lint command beyond current structural validation.
