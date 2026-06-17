# 004 — TODO-004: Security+ Starter Track

> **Status**: ✅ Completed (2026-06-17)
> Imported into RepoPact from `todos/TODO-004-security-plus-starter-track.md`; the source is preserved.
>
> **Outcome:** Added a real CompTIA Security+ (SY0-701) starter track under
> `src/content/security-plus/` — 5 domains, 18 original questions, 15 flashcards,
> 2 lessons, 2 PBQs — at `order: 3` with `passThreshold` 0.83. Also corrected
> Network+'s threshold to 0.80 so all three derive from official scaled passing ÷
> 900 (A+ 0.75, Network+ 0.80, Security+ 0.83). All content is original. Verified
> by `audits/AUDIT-2026-06-17-security-plus-starter.md` (validate:content, 48
> tests, build, a11y all green). Starter sample, not full coverage.

## Imported plan narrative

# TODO-004: Security+ Starter Track

Status: proposed  
Priority: P1  
Area: Content / Certification Expansion  
Owner: Unassigned  
Created: 2026-06-16  
Updated: 2026-06-16  
Related: `docs/multi-certification-plan.md`, `todos/TODO-001-true-cert-factory.md`, `todos/TODO-002-cert-authoring-guide.md`

## Problem

The multi-certification plan names Security+ as the second expansion after A+ and Network+, but there is no formal todo to represent that work. Security+ should be planned now so the factory and authoring guide account for more than one future single-exam certification.

## Desired Outcome

Create a minimal but real Security+ starter track after the factory is in place and Network+ starter assumptions are proven.

Target certification:

- Vendor: CompTIA
- Certification: Security+
- Exam: `SY0-701` unless updated by a newer official target before implementation.
- Suggested cert ID: `security-plus`
- Suggested ID prefix: `secplus`

## Dependencies

- `TODO-001` should be done before this starts.
- `TODO-002` should be done or active before content authoring.
- `TODO-003` should ideally be done first, because Network+ is the planned first expansion.

## Scope

### In Scope

- Add Security+ manifest entry.
- Add `src/content/security-plus/domains.json`.
- Add `src/content/security-plus/questions.json`.
- Add `src/content/security-plus/flashcards.json`.
- Optionally add starter `lessons.json`.
- Optionally add starter `pbqs.json`.
- Verify single-exam cert behavior after multiple tracks exist.
- Use only original educational content.

### Out Of Scope

- Full Security+ course coverage.
- Full Security+ PBQ bank.
- Release marketing copy for a complete Security+ product.
- Changes to A+ or Network+ content except shared fixes.

## Acceptance Criteria

- Security+ appears as a selectable track when enabled as real content.
- Security+ content validates.
- Security+ practice sessions work.
- Security+ flashcards work.
- Security+ learning path displays domains and any starter lessons.
- Security+ mock exam uses its manifest defaults and pass threshold.
- A+, Network+, and Security+ progress remain isolated.
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

- Switch among A+, Network+, and Security+.
- Confirm single-exam UI does not feel awkward.
- Confirm all-tracks analytics handles three tracks.

## Risks

- Security+ content can easily become too broad; keep starter scope narrow.
- Security+ exam objectives may change; verify the target exam before authoring.
- The UI may need stronger availability labels if starter tracks are not complete.

## Progress Log

- 2026-06-16: Todo created from the multi-certification plan Phase 3.

## Follow-Up Candidates

- Full Security+ content buildout.
- Security+ PBQ simulations.
- Security+ objective coverage tracker.

