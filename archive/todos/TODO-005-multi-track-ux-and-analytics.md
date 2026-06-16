# TODO-005: Multi-Track UX, Availability, And Analytics

Status: ready  
Priority: P1  
Area: Product UX / Analytics  
Owner: Unassigned  
Created: 2026-06-16  
Updated: 2026-06-16  
Related: `docs/multi-certification-plan.md`, `todos/TODO-001-true-cert-factory.md`

## Problem

The multi-certification plan calls out all-tracks analytics, track ordering, and "coming soon" behavior as decisions or confirmations. The app has cert-scoped screens and an all-tracks analytics panel appears when multiple tracks exist, but there is no dedicated todo to verify the complete multi-track user experience.

## Desired Outcome

When multiple certifications exist, the app should make track availability, ordering, active state, empty states, and all-tracks analytics clear and polished.

## Scope

### In Scope

- Track switcher behavior with two or more tracks.
- Track ordering from manifest or explicit metadata.
- Handling incomplete, hidden, or coming-soon tracks.
- Empty states for tracks with optional missing PBQs or lessons.
- Analytics overview across multiple tracks.
- Per-track analytics filtering.
- Copy updates where A+ assumptions leak into shared UI.

### Out Of Scope

- Content authoring for Network+ or Security+.
- Certification factory loader implementation.
- Major navigation redesign.

## Acceptance Criteria

- Track switcher has deterministic ordering.
- App has a deliberate behavior for incomplete or coming-soon tracks.
- All-tracks analytics displays useful information when two or more tracks exist.
- Per-track analytics remain scoped to the active cert.
- Empty states are clear for tracks without PBQs or lessons.
- Shared UI copy does not imply every track is A+ or two-core.
- Mobile-width track switching remains usable.

## Verification Plan

Run:

```powershell
npm test -- --run
npm run build
```

Recommended manual checks:

- Use at least two certs or a fixture cert.
- Switch tracks from the sidebar.
- Visit Dashboard, Learn, Practice, PBQ, Mock, Flashcards, Analytics, Notes, and Settings.
- Confirm all-tracks analytics appears only when meaningful.

## Risks

- A fixture track could accidentally ship as real content.
- Coming-soon behavior may need manifest fields that do not exist yet.
- Analytics may require more data than starter tracks provide.

## Progress Log

- 2026-06-16: Todo created to cover unresolved multi-cert plan UX questions.

## Follow-Up Candidates

- Add `status`, `order`, or `isAvailable` fields to `Certification`.
- Add a dedicated all-tracks analytics route if the inline panel becomes cramped.

