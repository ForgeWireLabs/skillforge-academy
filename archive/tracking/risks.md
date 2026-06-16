# Risk Register

Last updated: 2026-06-16

| ID | Risk | Severity | Status | Owner | Mitigation |
| --- | --- | --- | --- | --- | --- |
| RISK-001 | New certification requires hand-edits in multiple code/config files, making expansion error-prone. | P1 | open | Unassigned | Complete `TODO-001`; automate content discovery and bundling. |
| RISK-002 | Global mock pass threshold ignores per-cert `passThreshold`. | P2 | open | Unassigned | Update scoring/caller logic under `TODO-001`. |
| RISK-003 | Validation may pass when a manifest cert lacks required per-cert banks because missing files are read as empty arrays. | P1 | open | Unassigned | Add strict per-cert validation under `TODO-001`. |
| RISK-004 | Manual markdown tracking can drift from actual repo state. | P2 | open | Steward | Keep audits lightweight and update tracking during work; consider validation later. |
| RISK-005 | Future orchestration adoption could overwrite or duplicate repo-native tracking. | P3 | open | Steward | Treat current IDs as canonical and map them forward rather than replacing them. |

## Closed Risks

None yet.
