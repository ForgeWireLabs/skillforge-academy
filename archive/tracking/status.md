# Project Status

Last updated: 2026-06-16

## Summary

SkillForge Academy is a local-first Tauri/React desktop app with a usable CompTIA A+ track. The app has a manifest-backed certification model and cert-scoped learner progress, but it is not yet a true certification factory because content registration and bundle resources still have hardcoded A+ paths.

## Current Focus

`TODO-001`: True Certification Factory.

Goal: make adding a certification primarily a content operation instead of a code-registration operation.

## Current Phase

Foundation established. Multi-certification plan is still on track, with phases 0-2 mostly implemented and Phase 3 now split into tracked todos.

## Known Verification Baseline

Most recent recorded command baseline from 2026-06-16:

```text
npm test -- --run        -> passed, 34 tests
npm run validate:content -> passed, 1 certification, 133 questions, 36 flashcards, 8 PBQs, 36 lessons
npm run build            -> passed
```

## Current Architecture Pulse

- Generic cert/exam types exist.
- Manifest exists at `src/content/certifications.json`.
- Learner progress is cert-scoped.
- Lessons are now first-class content.
- UI mostly filters by active cert.
- Remaining factory gap is content discovery, bundling, validation strictness, pass threshold usage, and scaffolding.

## Next Action

Start `TODO-001` by planning and implementing the content discovery and bundling path.

Then use:

- `TODO-002` for authoring rules.
- `TODO-003` for Network+ starter track.
- `TODO-004` for Security+ starter track.
- `TODO-005` for multi-track UX and analytics polish.
- `TODO-006` for brand/docs/release readiness.
- `TODO-007` for plan reconciliation.

## Linked Trackers

- `tracking/true-cert-factory.md`
- `tracking/milestones.md`
