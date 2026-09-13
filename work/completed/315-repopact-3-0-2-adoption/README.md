# 315 — Adopt RepoPact 3.0.2

> **Status**: Complete
> **Owner**: governance
> **Parent coordination**: RepoPact WI037

## Intent

Move SkillForge Academy from the obsolete RepoPact 2.x package boundary to the
exact public `repopact==3.0.2` release. The migration preserves the repository's
in-repo schemas and native content/test gates; it does not vendor RepoPact
modules or recreate the retired flat module names.

## Acceptance criteria

- [x] **RPU-001** Pin the exact public `repopact==3.0.2` package and document the supported CLI entry points.
- [x] **RPU-002** Regenerate the canonical dashboard and pass RepoPact governance validation.
- [x] **RPU-003** Run the native content validation and application test gates.
- [x] **RPU-004** Record dated evidence and complete the adoption on the isolated migration branch.

## Evidence

`20260913-037-repopact-3-0-2-upgrade` records the package install, dashboard
regeneration, governance validation, content gate, and native Vitest suite.
