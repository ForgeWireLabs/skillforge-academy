# 001 — True Certification Factory

> **Status**: ✅ Complete
> **Owners**: Codex (implementation).
> **Depends on**: none.

## Intent

Make adding a certification a content operation instead of an app-code registration operation.

In scope:

- Browser/Vite bundled content discovery.
- Tauri resource bundling for all cert content.
- Per-cert mock pass threshold.
- Strict per-cert content validation.
- Certification scaffold command.
- Certification authoring documentation.
- Verification evidence.

Out of scope:

- Full Network+ content.
- Full Security+ content.
- Installer identity changes.
- Learner backup format changes.

## Decisions

- `src/content/certifications.json` remains the manifest source of truth.
- `src/content/index.ts` discovers cert banks with Vite glob imports.
- `src-tauri/tauri.conf.json` bundles the whole `src/content` directory.
- Required banks are `domains.json`, `questions.json`, and `flashcards.json`.
- Optional banks are `pbqs.json` and `lessons.json`.
- Mock pass/fail uses `Certification.passThreshold`, with `MOCK_PASS` retained as a fallback default.
- New cert scaffolding is exposed as `npm run scaffold:cert`.

## Scope

Changed:

- `src/content/index.ts`
- `src/content/validate.ts`
- `scripts/validate-content.mjs`
- `src-tauri/tauri.conf.json`
- `src/logic.ts`
- `src/App.tsx`
- `src/logic.test.ts`
- `scripts/scaffold-cert.mjs`
- `src/vite-env.d.ts`
- `docs/certification-authoring.md`
- `README.md`
- `CONTRIBUTING.md`
- `package.json`

## Closeout

Acceptance criteria:

- [x] Adding a second cert directory does not require editing `src/content/index.ts`.
- [x] Adding a second cert directory does not require manually listing each file in `src-tauri/tauri.conf.json`.
- [x] Mock exam pass/fail and UI pass line use `cert.passThreshold`.
- [x] Validation fails if any manifest cert is missing required domains, questions, or flashcards.
- [x] Validation reports per-cert counts.
- [x] Optional PBQ and lesson files may be absent without failing.
- [x] Lesson image validation still checks asset existence and alt text.
- [x] A documented certification authoring guide exists.
- [x] A scaffold command exists for new cert banks.
- [x] Existing A+ content still validates.
- [x] Existing tests pass.
- [x] Production build succeeds.
- [x] Desktop build succeeds with bundled content-directory resources.

Evidence:

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

Audit:

- `audits/AUDIT-2026-06-16-true-cert-factory.md`
