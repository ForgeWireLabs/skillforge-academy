---
id: 0004
title: "Keep A+ Compatibility As The Migration Anchor"
status: accepted
date: 2026-06-16
supersedes: []
---

<!-- repopact-source: tracking/decisions.md#DEC-003 -->

# 0004: Keep A+ Compatibility As The Migration Anchor

> Imported from `tracking/decisions.md` (DEC-003).

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
