# TODO-007: Multi-Certification Plan Reconciliation Audit

Status: ready  
Priority: P2  
Area: Audit / Architecture  
Owner: Unassigned  
Created: 2026-06-16  
Updated: 2026-06-16  
Related: `docs/multi-certification-plan.md`, `audits/`

## Problem

`docs/multi-certification-plan.md` was written as a draft architecture plan and now mixes completed work, changed implementation details, and remaining Phase 3 goals. As the repo moves into real multi-cert work, the plan needs a reconciliation audit so agents know what is done, what changed, and what remains.

## Desired Outcome

Produce an audit that compares the plan against current code and tracking files, then update the plan or create follow-up todos for any gaps.

## Scope

### In Scope

- Compare each plan section against current implementation.
- Mark plan items as done, changed, blocked, or still planned.
- Identify stale file paths, stale line references, and missing lesson support.
- Check whether decisions are already represented in `tracking/decisions.md`.
- Update `docs/multi-certification-plan.md` if it is materially stale.
- Create or update todos for uncovered work.

### Out Of Scope

- Implementing uncovered work.
- Writing Network+ or Security+ content.
- Major architecture redesign unless the audit finds a blocker.

## Acceptance Criteria

- A new audit exists in `audits/`.
- `docs/multi-certification-plan.md` is either updated or explicitly left as historical with a pointer to current tracking.
- Todo coverage exists for each remaining plan item.
- `tracking/status.md` and `tracking/milestones.md` reflect the reconciled state.

## Verification Plan

Manual audit. Recommended commands:

```powershell
rg -n -i "a-plus|aplus|220-1201|220-1202|MOCK_PASS|passThreshold|certifications|activeCertId" src src-tauri scripts docs todos tracking --glob "!src-tauri/target/**" --glob "!src-tauri/gen/**"
npm run validate:content
```

## Risks

- Updating the plan too aggressively could erase useful history; preserve historical context where helpful.
- Some items may be intentionally deferred; record that rather than treating every gap as a defect.

## Progress Log

- 2026-06-16: Todo created to keep the architecture plan aligned with implementation and tracking.

## Follow-Up Candidates

- Add an ADR for final certification manifest fields.
- Add a plan coverage table to tracking.

