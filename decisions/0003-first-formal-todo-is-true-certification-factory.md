---
id: 0003
title: "First Formal Todo Is True Certification Factory"
status: accepted
date: 2026-06-16
supersedes: []
---

<!-- repopact-source: tracking/decisions.md#DEC-002 -->

# 0003: First Formal Todo Is True Certification Factory

> Imported from `tracking/decisions.md` (DEC-002).

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
