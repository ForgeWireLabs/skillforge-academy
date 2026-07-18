---
id: 0008
title: "Consume RepoPact From PyPI (repopact==1.8.0) Instead of Vendoring the Validator"
status: accepted
date: 2026-06-24
supersedes: []
---

# 0008: Consume RepoPact From PyPI (repopact==1.8.0) Instead of Vendoring the Validator

## Context

Decision [0007](0007-adopt-canonical-repopact-governance.md) adopted canonical
RepoPact 1.6.0 by **vendoring** the validator into the repo (`scripts/validate_repo.py`
plus its `frontmatter.py` / `repo_model.py` import chain) and validating with
`python scripts/validate_repo.py`. SkillForge is a clean adopter — the vendored copy
carried no local patches.

RepoPact is now published on PyPI (`repopact`, currently 1.8.0), which adds the
`deferred` and `rejected` decision statuses (RepoPact decision 0017) and the 1.7.0
inbound-reference drift checks. Re-vendoring every release means copying files and
re-running a three-way merge each time. Since SkillForge carries no local
modifications to the validator, there is nothing to preserve across upgrades — the
vendored copy is pure duplication.

A key property of RepoPact makes the switch safe: the validator resolves the
repository root from the current working directory and reads **this repository's**
`schemas/*.json` (`root/schemas/...`), not the package's. Schemas are the repo's own
declared contracts and stay in-repo regardless of how the tooling is delivered.

## Decision

Consume RepoPact as a **pinned PyPI dependency** instead of vendoring it.

- `requirements-repopact.txt` pins `repopact==1.8.0`.
- The vendored modules `scripts/validate_repo.py`, `scripts/frontmatter.py`, and
  `scripts/repo_model.py` are removed.
- Governance validation runs via the CLI: `python -m repopact_cli validate`
  (equivalently `repopact validate` when the console script is on `PATH`).
- `schemas/` remains in-repo. The decision `status` enum in
  `schemas/record-frontmatter.schema.json` is updated to include `rejected` and
  `deferred` so records can use the 1.8.0 vocabulary.
- SkillForge's own scripts (`*.mjs`, `sign-windows.ps1`) are unaffected.

## Alternatives considered

- **Re-vendor 1.8.0 (copy files in).** Rejected: SkillForge carries no local
  validator patches, so vendoring is pure duplication and recurring merge cost. A
  pin captures the version just as precisely.
- **Leave schemas out and rely on the package's bundled schemas.** Not possible: the
  validator reads the repo's `root/schemas/`; the package ships schemas only as seed
  data for `repopact init`. Schemas must stay in-repo.
- **Unpinned `repopact`.** Rejected: a clean checkout or CI could silently validate
  against a newer ruleset. The pin keeps validation reproducible.

## Consequences

- Upgrades become `pip install -U repopact` + a pin bump, with no file copying.
- A clean checkout (and any CI) must `pip install -r requirements-repopact.txt`
  before validating; the governance code no longer travels in the repo. This is the
  deliberate trade for dropping vendor-maintenance — acceptable because the schemas
  (the part that is genuinely SkillForge's contract) still travel in-repo.
- The repo gains the `deferred` and `rejected` decision statuses.
- Reproducibility is preserved by the exact version pin.

## Implementation update (2026-07-18)

Work item 307 advances the exact pin to `repopact==2.2.0`. This release adds
validator-enforced canonical dashboard equality: a missing or stale checked-in
dashboard is rejected and repaired deterministically with `repopact dashboard`.
