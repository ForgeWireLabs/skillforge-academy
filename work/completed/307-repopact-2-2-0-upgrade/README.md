# 307 — Upgrade RepoPact to 2.2.0

> **Status**: Complete
> **Owner**: governance

## Intent

Advance SkillForge from RepoPact 2.1.0 to the exact 2.2.0 PyPI release so its
checked-in dashboard is a validator-enforced canonical projection.

## Acceptance criteria

- [x] **RPU-001** Pin `repopact==2.2.0` and align the PyPI-consumption decision.
- [x] **RPU-002** Regenerate the dashboard and pass RepoPact validation.
- [x] **RPU-003** Run the repository's relevant native validation gate.
- [x] **RPU-004** Record evidence, close the item, and publish the upgrade.

## Evidence

`20260718-307-repopact-2-2-0-upgrade` records the exact package install,
canonical dashboard validation, and passing content gate.
