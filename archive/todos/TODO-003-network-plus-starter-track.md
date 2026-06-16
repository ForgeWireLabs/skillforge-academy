# TODO-003: Network+ Starter Track

Status: proposed  
Priority: P1  
Area: Content / Certification Expansion  
Owner: Unassigned  
Created: 2026-06-16  
Updated: 2026-06-16  
Related: `docs/multi-certification-plan.md`, `todos/TODO-001-true-cert-factory.md`, `todos/TODO-002-cert-authoring-guide.md`

## Problem

The multi-certification plan names Network+ as the first expansion after A+, but there is no formal todo for creating the Network+ track. Without a bounded starter todo, implementation could jump straight into large-scale content authoring before the factory, validation, and authoring rules are ready.

## Desired Outcome

Create a minimal but real Network+ starter track that proves the certification factory with a second certification while keeping content scope small enough to review carefully.

Target certification:

- Vendor: CompTIA
- Certification: Network+
- Exam: `N10-009` unless updated by a newer official target before implementation.
- Suggested cert ID: `network-plus`
- Suggested ID prefix: `netplus`

## Dependencies

- `TODO-001` should be done before this starts.
- `TODO-002` should be done or active before full content authoring.

## Scope

### In Scope

- Add Network+ manifest entry.
- Add `src/content/network-plus/domains.json`.
- Add `src/content/network-plus/questions.json`.
- Add `src/content/network-plus/flashcards.json`.
- Optionally add starter `lessons.json`.
- Optionally add starter `pbqs.json`.
- Include enough content to verify UI, filtering, track switching, analytics, practice, flashcards, and validation.
- Use only original educational content.
- Update screenshots/docs only if user-facing behavior changes meaningfully.

### Out Of Scope

- Full Network+ course coverage.
- Full PBQ bank.
- Release marketing copy for a complete Network+ product.
- Security+ content.

## Acceptance Criteria

- Network+ appears as a selectable track.
- Network+ content validates.
- Network+ practice sessions work.
- Network+ flashcards work.
- Network+ learning path displays domains and any starter lessons.
- Network+ does not pollute A+ progress, analytics, bookmarks, card ratings, or attempts.
- Track switching preserves per-cert state.
- No live exam dumps or proprietary content are used.

## Suggested Minimum Content

- All official domains represented in `domains.json`.
- At least one question per domain.
- At least one flashcard per domain.
- At least one lesson for one domain if lesson support is being proven.
- No PBQs required for starter, unless used to prove optional-bank behavior.

## Verification Plan

Run:

```powershell
npm run validate:content
npm test -- --run
npm run build
```

Recommended manual checks:

- Switch from A+ to Network+.
- Open Dashboard, Learn, Practice, Mock Exam, Flashcards, and Analytics.
- Switch back to A+ and confirm A+ state remains scoped.

## Risks

- Network+ exam objectives may change; verify the target exam before authoring.
- Starter content may be mistaken for full coverage; label docs and UI carefully if needed.
- Creating this before `TODO-001` could require duplicate manual registration work.

## Progress Log

- 2026-06-16: Todo created from the multi-certification plan Phase 3.

## Follow-Up Candidates

- Full Network+ content buildout.
- Network+ PBQ simulations.
- Network+ objective coverage tracker.

