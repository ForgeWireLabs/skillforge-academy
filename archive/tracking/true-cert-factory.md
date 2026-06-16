# True Certification Factory Tracker

Last updated: 2026-06-16  
Related Todo: `todos/TODO-001-true-cert-factory.md`  
Status: ready

## Goal

Make certification addition a repeatable factory workflow:

```text
manifest entry + content folder + optional assets -> validation -> build -> track appears
```

## Current Baseline

| Capability | Status | Notes |
| --- | --- | --- |
| Manifest-driven cert metadata | mostly done | `src/content/certifications.json` exists. |
| Cert-scoped learner progress | done | State includes `activeCertId` and per-cert progress buckets. |
| Cert-scoped UI pools | mostly done | Dashboard, learning, practice, PBQ, mock, flashcards, analytics filter by active cert. |
| Lessons as content | done | Lesson schema and validation exist. |
| Browser bundled content auto-discovery | not done | `src/content/index.ts` still hardcodes A+ imports. |
| Desktop resource auto-bundling | not done | `tauri.conf.json` still lists A+ files. |
| Per-cert pass threshold usage | not done | `MOCK_PASS` still drives mock results. |
| Strict per-cert bank validation | partial | Aggregate validation works, but required banks are not enforced per cert. |
| Scaffold/new-cert authoring workflow | not done | No script or guide yet. |

## Work Packages

### WP1: Browser Content Discovery

Target:

- Replace manual cert imports with manifest-driven glob loading.

Done when:

- Adding `src/content/<cert-id>/domains.json`, `questions.json`, and `flashcards.json` does not require editing `src/content/index.ts`.

### WP2: Desktop Resource Bundling

Target:

- Bundle all certification content without hand-listing every file.

Done when:

- Tauri build includes all content for every manifest cert.

### WP3: Per-Cert Mock Threshold

Target:

- Use `Certification.passThreshold`.

Done when:

- Mock setup, results, attempt records, and tests reflect per-cert thresholds.

### WP4: Strict Validation

Target:

- Validate each manifest cert independently.

Done when:

- Missing required banks fail.
- Per-cert counts are reported.
- Optional PBQs and lessons remain optional.

### WP5: Scaffold And Authoring Guide

Target:

- Make new cert creation repeatable.

Done when:

- Script or template exists.
- Docs explain IDs, banks, optional assets, validation, and build.

### WP6: Evidence And Audit

Target:

- Prove factory behavior.

Done when:

- Required commands pass.
- Audit is created and linked.

## Exit Criteria

- `TODO-001` is in `done`.
- `TODO-002` exists and covers authoring rules.
- `TODO-005` exists and covers multi-track UX verification.
- `tracking/risks.md` closes or downgrades `RISK-001`, `RISK-002`, and `RISK-003`.
- A factory audit is `passed` or `passed-with-notes`.
