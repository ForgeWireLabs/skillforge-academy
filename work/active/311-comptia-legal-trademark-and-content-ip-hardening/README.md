# 311 — CompTIA legal, trademark, and content-IP hardening

> **Status**: Active
>
> Pre-commercialization cleanup of CompTIA-specific legal/IP presentation and
> content provenance. This is a bounded hardening pass, not a product redesign
> and not a substitute for advice from qualified counsel.
> **Owners**: Steward / Product lead; Content, Release, and Documentation support.
> **Depends on**: none.

## Intent

SkillForge Academy is independently branded and already requires original
educational content, prohibits recalled live exam questions/dumps, and carries a
non-affiliation disclaimer. A repository-specific review nevertheless identified
several areas that should be hardened before broader public or commercial
positioning:

1. Objective registries currently mirror vendor objective titles closely enough
   to create avoidable copyright/licensing ambiguity, especially in an
   Apache-2.0 repository.
2. Mock-exam documentation/modeling treats percentages such as 75%, 80%, and 83%
   as if they were CompTIA's official passing lines, even though CompTIA publishes
   scaled scores rather than a public raw-percent conversion.
3. Trademark/non-affiliation rules should be made durable across all public and
   in-app surfaces, including explicit restrictions on unlicensed logos, badges,
   partner marks, and official/authorized claims.
4. Historical `Apex A+ Academy` branding should remain only where needed for
   compatibility/history and should not return as consumer-facing product
   branding.
5. The existing no-dumps/original-content stance should become an auditable
   content-provenance rule rather than only authoring guidance.

The desired outcome is a clean separation between **SkillForge-owned software and
educational content** and **third-party certification names, objective references,
and proprietary assessment material** while preserving useful objective mapping
and exam-preparation functionality.

## Boundaries

### In scope

- A+, Network+, and Security+ objective registries and objective display text.
- Certification manifests, scoring/readiness metadata, mock-exam copy, and tests.
- README, application UI, release/installer copy, screenshots/store-facing copy,
  certification-authoring guidance, contributor guidance, and relevant audits.
- Trademark/non-affiliation and third-party-IP notices.
- Historical `Apex A+ Academy` references and compatibility rationale.
- Existing assessment/lesson/PBQ/flashcard provenance review and durable rules
  preventing recalled live exam content or proprietary assessment reconstruction.
- A final evidence-backed closeout audit.

### Out of scope

- Removing truthful nominative references to CompTIA certifications or exam IDs.
- Seeking CompTIA Authorized Partner status or negotiating a trademark/content
  license.
- Treating this work item as a legal opinion or guarantee of non-infringement.
- Rewriting ordinary technical facts merely because those facts also appear in
  CompTIA objectives.
- Changing SkillForge's core study workflows unless required to correct scoring
  semantics or legal/IP presentation.
- General non-CompTIA vendor hardening beyond making the resulting rules
  vendor-agnostic where practical.

## Required implementation direction

### Objective mapping

Keep public identifiers needed to describe compatibility and mapping, such as
`220-1201`, `220-1202`, `N10-009`, `SY0-701`, and objective codes such as `2.1`.
Replace copied vendor objective-title prose with concise SkillForge-authored
summaries. Preserve IDs, domain relationships, order, and content mappings so
coverage remains mechanically verifiable.

Do not import or reproduce the vendor's complete objective bullet hierarchy as a
substitute for writing original curriculum structure.

### Mock/readiness scoring

CompTIA scaled passing scores may be stated accurately as vendor facts when the
source and exam version are current. Do **not** present a division of the scaled
score by the scale maximum as an official percentage-correct threshold.

Any percentage used by SkillForge to grade a mock or estimate readiness must be
named as a **SkillForge readiness benchmark/practice threshold** (or equivalent),
not as CompTIA's official passing percentage. The model should support exam-level
facts where A+ Core 1 and Core 2 differ.

### Trademark presentation

SkillForge Academy remains the product/source brand. CompTIA certification names
are referential track names. Public and in-app surfaces must not imply sponsorship,
affiliation, authorization, or endorsement.

Do not use CompTIA logos, certification badge artwork, Authorized Partner marks,
or equivalent protected branding unless an applicable written authorization is
recorded.

### Licensing and notices

Add or refresh a durable notice that separates the Apache-2.0 license covering
SkillForge contributions from third-party trademark rights and proprietary
third-party assessment material. The notice should be easy to discover from the
README/release-facing documentation.

### Legacy branding

`Apex A+ Academy` may remain in migration/history text and invisible compatibility
identifiers where changing it would break existing learner data. Consumer-facing
branding should use SkillForge Academy, and any retained legacy identifiers must
have an explicit compatibility rationale rather than being treated as current
branding.

### Content provenance

Existing original-content/no-dumps rules become a release-governed invariant for
certification content. At minimum, the policy must distinguish:

- original scenarios derived from public objectives, standards, documentation,
  and subject-matter knowledge;
- permissible factual references to exam structure/objective identifiers; and
- prohibited recalled live questions, exam dumps, reconstructed vendor PBQs,
  answer-key material, or proprietary assessment content.

The current A+, Network+, and Security+ banks must receive a documented review
against this rule before closeout.

## Acceptance strategy

The work item is not complete when wording is merely added to the README. Closeout
requires all eight acceptance criteria in `work-item.json` to carry evidence,
including repository-wide inventory, all-three-track objective cleanup, scoring
semantics, trademark presentation, third-party notices, legacy-brand audit,
content-provenance review, and a final audit with validation/test evidence.

## Closeout

Move this directory to `work/completed/` only after every acceptance criterion is
satisfied or explicitly waived with rationale. The closeout audit must identify
any residual issue that depends on actual CompTIA permission, a future commercial
agreement, or qualified legal counsel rather than silently treating it as solved
by repository wording.
