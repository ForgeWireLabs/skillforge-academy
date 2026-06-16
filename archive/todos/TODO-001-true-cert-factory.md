# TODO-001: True Certification Factory

Status: ready  
Priority: P1  
Area: Architecture / Content Platform  
Owner: Unassigned  
Created: 2026-06-16  
Updated: 2026-06-16  
Related: `docs/multi-certification-plan.md`, `AGENTS.md`, `tracking/status.md`

## Problem

SkillForge Academy is mostly certification-aware at runtime, but adding a new certification still requires hand-editing multiple registration points. That means the app is not yet a true factory for Network+, Security+, or later tracks.

Current friction:

- `src/content/index.ts` statically imports A+ banks.
- `src-tauri/tauri.conf.json` lists A+ resource files one by one.
- Mock pass/fail still uses global `MOCK_PASS` instead of `Certification.passThreshold`.
- Content validation aggregates all cert content and does not strictly fail when a manifest cert lacks required banks.
- There is no scaffolding command or documented authoring path for a new certification.

## Desired Outcome

Adding a certification should be a content operation, not an app-code operation:

1. Add an entry to `src/content/certifications.json`.
2. Add `src/content/<cert-id>/domains.json`.
3. Add `src/content/<cert-id>/questions.json`.
4. Add `src/content/<cert-id>/flashcards.json`.
5. Optionally add `pbqs.json`, `lessons.json`, and lesson assets.
6. Run validation and build.
7. The app discovers, validates, bundles, displays, and scopes the track.

## Scope

### In Scope

- Browser/Vite bundled content discovery.
- Tauri resource bundling strategy for all cert content.
- Per-cert mock pass threshold.
- Strict per-cert content validation.
- New-cert scaffold command or template.
- Documentation for adding a certification.
- Tests or validation coverage for the factory behavior.

### Out Of Scope

- Authoring full Network+ content.
- Authoring full Security+ content.
- Rebranding or changing installer identity.
- Changing learner backup format except where required for tested compatibility.

## Implementation Notes

Recommended path:

1. Replace manual A+ imports in `src/content/index.ts` with `import.meta.glob` over `src/content/*/{domains,questions,flashcards,pbqs,lessons}.json`.
2. Keep `certifications.json` as the manifest source of truth.
3. Build `bundledContent` by walking manifest cert IDs and resolving matching glob modules.
4. Treat `domains.json`, `questions.json`, and `flashcards.json` as required for every manifest cert.
5. Treat `pbqs.json` and `lessons.json` as optional but validate if present.
6. Change Tauri resources from explicit A+ files to a whole-content resource strategy if supported by Tauri config, or generate the resource map with a script.
7. Update `scoreMock` to accept a pass threshold or return raw score while caller applies `cert.passThreshold`.
8. Add a scaffold script, for example `npm run scaffold:cert -- --id network-plus --prefix netplus --exam N10-009`.
9. Document the authoring flow in `docs/`.

## Acceptance Criteria

- Adding a second cert directory does not require editing `src/content/index.ts`.
- Adding a second cert directory does not require manually listing each file in `src-tauri/tauri.conf.json`, or a script generates that list from content.
- Mock exam pass/fail and UI pass line use `cert.passThreshold`.
- Validation fails if any manifest cert is missing required domains, questions, or flashcards.
- Validation reports per-cert counts.
- Optional PBQ and lesson files may be absent without failing.
- Lesson image validation still checks asset existence and alt text.
- A documented certification authoring guide exists.
- A scaffold command or template exists for new cert banks.
- Existing A+ content still validates.
- Existing tests still pass.
- Production build still succeeds.

## Verification Plan

Run:

```powershell
npm run validate:content
npm test -- --run
npm run build
```

If Tauri resource handling changes, also run:

```powershell
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
```

For a complete desktop packaging check, run:

```powershell
npm run desktop:build
```

## Suggested Test Fixture

Create a tiny temporary or committed fixture certification during implementation:

- `id`: `factory-smoke`
- `idPrefix`: `factory`
- one exam
- one domain
- one question
- one flashcard

The fixture should prove discovery and validation. If committed, mark it as hidden/sample so it does not appear as a real learner track. If temporary, the validation script should be able to exercise it without polluting production content.

## Risks

- Vite JSON glob typing can be awkward; keep the loader small and typed at the boundary.
- Tauri resource glob support may differ by version; verify with build output, not assumption.
- A sample cert appearing in production would confuse users; use a fixture strategy carefully.
- Strict validation may expose existing content issues; fix content rather than weakening validation.

## Progress Log

- 2026-06-16: Todo created from certification-factory reevaluation. Initial status `ready`.

## Follow-Up Candidates

- `TODO-002`: Certification authoring guide and content quality rubric.
- `TODO-003`: Network+ starter track.
- `TODO-004`: Security+ starter track.
- `TODO-005`: Multi-track UX, availability, and analytics.
- `TODO-007`: Multi-certification plan reconciliation audit.
