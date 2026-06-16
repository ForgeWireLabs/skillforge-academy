# TODO-006: Multi-Cert Brand, Docs, And Release Readiness

Status: ready  
Priority: P2  
Area: Documentation / Release  
Owner: Unassigned  
Created: 2026-06-16  
Updated: 2026-06-16  
Related: `docs/multi-certification-plan.md`, `README.md`, `ROADMAP.md`, `CHANGELOG.md`

## Problem

The product has already been renamed to SkillForge Academy, but the public docs and release copy still describe the product primarily as an A+ app. That is accurate today, but once additional tracks exist the docs, roadmap, screenshots, release notes, and installer copy need a coordinated multi-certification pass.

## Desired Outcome

Prepare the documentation and release surface for a multi-certification SkillForge Academy launch while preserving truthful labeling of incomplete or starter tracks.

## Scope

### In Scope

- README architecture and feature sections.
- Roadmap updates.
- Changelog entries.
- Tauri short and long descriptions.
- Screenshots if UI changes significantly.
- Trademark/disclaimer wording for multiple CompTIA certifications.
- Release checklist or audit entry for multi-cert readiness.

### Out Of Scope

- App rebrand away from SkillForge Academy.
- Changing the application identifier.
- Code signing acquisition.
- Full release automation redesign.

## Acceptance Criteria

- README accurately describes current available tracks.
- ROADMAP reflects factory completion and planned track sequence.
- CHANGELOG includes multi-cert platform changes when shipped.
- Tauri descriptions are not misleading once more tracks exist.
- Trademark notice covers multiple CompTIA marks without implying endorsement.
- A release audit is created before publishing a multi-cert build.

## Verification Plan

Run:

```powershell
npm run build
```

Manual checks:

- Read README from top to bottom for stale A+-only claims.
- Read Tauri metadata for release-store accuracy.
- Confirm release notes match actual shipped tracks.

## Risks

- Overstating starter tracks could mislead learners.
- Screenshots may lag behind UI changes.
- Installer identity should remain stable unless a dedicated migration exists.

## Progress Log

- 2026-06-16: Todo created to cover Phase 3 brand/docs/release work.

## Follow-Up Candidates

- Multi-cert screenshot refresh.
- Release smoke checklist.
- Store/listing copy if distribution expands.

