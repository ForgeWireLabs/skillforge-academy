# AUDIT-2026-06-16-true-cert-factory: True Certification Factory Implementation

Type: architecture / implementation  
Status: passed-with-notes  
Date: 2026-06-16  
Auditor: Codex  
Related Todo: `001`, `002`, `302`

## Scope

Audit the implementation of the true certification factory foundation:

- Browser bundled content auto-discovery.
- Desktop content resource bundling.
- Per-cert validation strictness.
- Per-cert mock pass threshold usage.
- Certification scaffold command.
- Certification authoring documentation.

## Context

`001-true-cert-factory` was created because the app was mostly cert-aware at runtime but still required hand edits in `src/content/index.ts` and `src-tauri/tauri.conf.json` for each new certification. The work also needed to close the global mock-pass-threshold and aggregate-validation gaps.

## Method

Files reviewed/changed:

- `src/content/index.ts`
- `src/content/validate.ts`
- `scripts/validate-content.mjs`
- `src-tauri/tauri.conf.json`
- `src/logic.ts`
- `src/App.tsx`
- `src/logic.test.ts`
- `scripts/scaffold-cert.mjs`
- `docs/certification-authoring.md`
- `README.md`
- `CONTRIBUTING.md`

Commands run:

```text
npm run validate:content
npm test -- --run
npm run build
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
npm run desktop:build
```

## Findings

### P1: Static browser content registration blocked cert factory

Status: addressed.

Evidence:

- `src/content/index.ts` now uses `import.meta.glob` for per-cert banks.
- New cert folders matching the manifest no longer require adding imports to `src/content/index.ts`.

### P1: Desktop resources were A+-only

Status: addressed.

Evidence:

- `src-tauri/tauri.conf.json` now maps `../src/content` to `content`.
- `npm run desktop:build` completed and produced the NSIS installer.

### P1: Validation could hide missing per-cert banks

Status: addressed.

Evidence:

- Runtime and CLI validation now check required bank content per certification.
- CLI output now reports per-cert counts.

### P2: Mock scoring ignored certification pass thresholds

Status: addressed.

Evidence:

- `scoreMock` accepts a caller-provided threshold.
- `MockExam` passes `cert.passThreshold`.
- Unit coverage confirms a non-default threshold is honored.

### P2: New-cert creation lacked a repeatable entry point

Status: addressed.

Evidence:

- `npm run scaffold:cert` added.
- `docs/certification-authoring.md` added and linked.

## Evidence

```text
npm run validate:content
✓ Content valid: 1 certification(s), 9 domains, 133 questions, 36 flashcards, 8 PBQs, 36 lessons
  per cert -> a-plus: 9 domains, 133 questions, 36 flashcards, 8 PBQs, 36 lessons

npm test -- --run
Test Files  2 passed (2)
Tests       35 passed (35)

npm run build
✓ built

cargo fmt --check --manifest-path src-tauri/Cargo.toml
passed

cargo check --manifest-path src-tauri/Cargo.toml
Finished dev profile

npm run desktop:build
Built application and NSIS installer successfully.
```

## Risks

- The scaffold command creates starter educational placeholders; those must be replaced before any real track release.
- A future multi-track UX pass is still needed to handle incomplete or coming-soon tracks elegantly.
- A negative validation fixture was not committed; future validation tests could make required-bank behavior more explicit.

## Actions

- Continue with `005-multi-track-ux-and-analytics` before shipping multiple visible tracks.
- Use `003-network-plus-starter-track` for the Network+ starter track after UX assumptions are clear.
- Consider adding JSON schema or validator unit tests if content bank complexity grows.

## Final Status

Passed with notes. Work items `001`, `002`, and milestone `302` are complete.

