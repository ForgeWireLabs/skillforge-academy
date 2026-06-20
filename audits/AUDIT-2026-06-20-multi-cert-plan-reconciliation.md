# AUDIT-2026-06-20-multi-cert-plan-reconciliation: Multi-Certification Plan Reconciliation

Type: audit / architecture
Status: passed
Date: 2026-06-20
Auditor: agent
Related Todo: `007` (`work/active/007-multi-cert-plan-reconciliation-audit/`)

## Scope

Reconcile `docs/multi-certification-plan.md` (the original 2026-06-14 design
draft) against the current codebase and tracking, marking each section as done /
changed / still-planned, identifying stale paths and line references, and either
updating the plan or marking it historical with a pointer to current state.

## Context

The plan was written as a design-only draft "no call sites change until this is
approved." Since then all five phases shipped and the three CompTIA tracks are
objective-complete. The plan now mixes completed work, changed implementation
details, and stale file references, so it needed a reconciliation pass before it
misleads future agents.

## Method

- Files reviewed: `docs/multi-certification-plan.md`, `src/types.ts`,
  `src/logic.ts`, `src/content/index.ts`, `src/content/certifications.json`,
  `src-tauri/src/lib.rs`.
- Commands run:
  - `rg -n "ExamCode" src src-tauri` → 0 hits (union retired).
  - `ls src/content/*.json` → only `certifications.json` (banks moved to
    `src/content/<cert>/`).
  - `grep -n "MOCK_PASS|MOCK_DEFAULT" src/logic.ts`, `grep -n "SCHEMA_VERSION"`.
  - `grep -n "load_content|expect" src-tauri/src/lib.rs`.

## Findings

### P2: Plan presented as a live draft while fully implemented

Status: resolved
Evidence: header read "Status: Draft for review"; intro read "It is design-only;
no call sites change until this is approved"; the Phase 3 row (§5) was unmarked
while Network+/Security+ content and the brand pass have all shipped.
Recommendation (applied): added a HISTORICAL/superseded banner pointing to
`CHANGELOG.md`, `docs/certification-authoring.md`, `ROADMAP.md`, `work/`, and
`audits/`; marked the Phase 3 row ✅ DONE; softened the "design-only" sentence.

### P2: Stale file paths and line references throughout

Status: documented (left in place by design)
Evidence:
- §2.3 / §6 link to `src/content/domains.json`, `questions.json`,
  `flashcards.json`, `pbqs.json` — these moved to `src/content/<cert>/`; only
  `certifications.json` remains at the top level.
- §1.1, §6 reference the `ExamCode` union — retired for `ExamId` (0 references in
  `src`/`src-tauri`).
- §2.4 cites `lib.rs:64` for the loader (now `load_content` at `lib.rs:66`) and
  §5 cites `lib.rs:97` for the window/panic message (now `lib.rs:144`, and it
  already reads "SkillForge Academy").
- §2.1's `Certification` interface omits `idPrefix` (required), `order?`, and
  `status?`, which all exist in `src/types.ts`.
Recommendation: these are historical design references; per the "preserve design
history" risk in TODO-007, they are called out in the banner rather than
rewritten line by line. Current API of record is `src/types.ts` +
`docs/certification-authoring.md`.

### P3: `MOCK_PASS` / `MOCK_DEFAULT_*` constants still present

Status: no action (not a defect)
Evidence: `src/logic.ts:230-232` still defines `MOCK_PASS = 0.75`,
`MOCK_DEFAULT_QUESTIONS = 90`, `MOCK_DEFAULT_MINUTES = 90`. §6 listed these "to
retire → per-cert/per-exam manifest values."
Assessment: call sites already read `cert.passThreshold` / `cert.exams`
(`App.tsx`), and `scoreMock(..., passThreshold = MOCK_PASS)` uses the constant
only as a default fallback. Retaining them as fallbacks is correct, not stale.

### P3: "tracking/status.md" / "tracking/milestones.md" no longer live

Status: documented
Evidence: TODO-007 asks to update `tracking/status.md` and
`tracking/milestones.md`; those files had been moved to `archive/tracking/` and
have since been deleted as a confusing duplicate of live state. The live tracking
system is the RepoPact `work/` queue plus `audits/`.
Recommendation: do not resurrect the archived files; this audit + the `work/`
item status is the reconciled record of truth.

## Plan section reconciliation

| Plan section | State |
| --- | --- |
| §1 Guiding principles | Done (ExamCode retired, id-prefix migration shipped) |
| §2.1 Manifest types | Done + changed (added `idPrefix`/`order`/`status`) |
| §2.2 Content gains certId | Done |
| §2.3 ID uniqueness | Done (paths stale) |
| §2.4 File layout / loaders | Done (line refs stale) |
| §3 Per-cert progress | Done |
| §4 v2→v3 migration | Done |
| §5 Phasing (0–3) | Done — Phase 3 now marked DONE |
| §6 Hardcoded sites | Retired, except intentional `MOCK_*` fallbacks |
| §7 Resolved decisions | Done (incl. order/status from item 005) |

No uncovered plan item requires a new todo: the only remaining forward work
(authoring further tracks) is already covered by milestones `303`/`304`/`305` and
items `210`/`214`.

## Evidence

```text
$ rg -n "ExamCode" src src-tauri        # (no output — retired)
$ ls src/content/*.json
src/content/certifications.json
$ grep -n "MOCK_PASS\|MOCK_DEFAULT" src/logic.ts
230:export const MOCK_PASS = 0.75;
231:export const MOCK_DEFAULT_QUESTIONS = 90;
232:export const MOCK_DEFAULT_MINUTES = 90;
306:  passThreshold = MOCK_PASS
$ grep -n "load_content\|expect" src-tauri/src/lib.rs
66:fn load_content(app: AppHandle) -> Result<Value, String> {
144:        .expect("error while running SkillForge Academy");
```

## Risks

- Over-editing the design doc would erase useful rationale; mitigated by marking
  it historical and pointing to the current sources rather than rewriting it.
- Future readers may still follow a stale inline link; the banner warns of this.

## Actions

- [x] Add historical/superseded banner to the plan with pointers
- [x] Mark Phase 3 row DONE; soften "design-only" intro
- [x] Reconcile each section (table above)
- [x] Confirm no uncovered plan item needs a new todo
- [x] Record that `tracking/*` is archived; `work/` + `audits/` are the live record

## Final Status

Passed. `docs/multi-certification-plan.md` is now explicitly historical with a
pointer to current state, every section is reconciled, and remaining forward work
is already covered by existing work items.
