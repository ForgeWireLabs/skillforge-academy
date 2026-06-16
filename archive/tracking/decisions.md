# Decision Log

Last updated: 2026-06-16

## DEC-001: Use Repo-Native Markdown Foundation As The Initial System

Date: 2026-06-16  
Status: accepted  
Related: `AGENTS.md`, `todos/`, `audits/`, `tracking/`

Decision:

SkillForge Academy will use markdown-based agent, todo, audit, and tracking files as its initial coordination foundation.

Rationale:

- The user wants the foundation in place first.
- Markdown keeps the system transparent and easy to edit.
- The structure can be mapped into another orchestration system later without blocking current work.

Consequences:

- Agents must manually keep tracking files current.
- Future orchestration adoption should preserve or map the existing todo, audit, decision, and risk IDs.

## DEC-002: First Formal Todo Is True Certification Factory

Date: 2026-06-16  
Status: accepted  
Related: `todos/TODO-001-true-cert-factory.md`

Decision:

The first formal todo is `TODO-001: True Certification Factory`.

Rationale:

- Multi-certification support is the next architectural unlock.
- Current runtime is mostly cert-aware, but adding a cert still requires hand-edited registration points.
- Fixing the factory before authoring Network+ or Security+ prevents repeated manual wiring.

Consequences:

- Future certification-content work should depend on or follow `TODO-001`.
- Work that adds new real certs before `TODO-001` should record why it is safe.

## DEC-003: Keep A+ Compatibility As The Migration Anchor

Date: 2026-06-16  
Status: accepted  
Related: `docs/multi-certification-plan.md`

Decision:

Existing A+ progress, backups, and storage compatibility remain protected while factory work proceeds.

Rationale:

- A+ is the shipped track.
- Existing users should not lose progress because the platform expands.

Consequences:

- Schema changes require migration tests.
- The `apex-state` localStorage key and `.apexbackup` compatibility remain unless a future migration todo explicitly changes them.
