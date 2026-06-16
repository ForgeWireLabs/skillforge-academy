# 002 — Certification Authoring Guide And Quality Rubric

> **Status**: ✅ Complete
> **Owners**: Codex (documentation).
> **Depends on**: 001.

## Intent

Create durable guidance for adding and maintaining certification tracks so future content work does not drift in manifest shape, ID rules, content-bank structure, lesson assets, or originality standards.

In scope:

- Authoring guide under `docs/`.
- Required vs optional bank documentation.
- ID examples for A+, Network+, and Security+.
- Lesson asset and alt-text rules.
- Question, flashcard, PBQ, and lesson quality rubrics.
- Pre-PR checklist.
- Links from contributor and development docs.

Out of scope:

- Full Network+ content.
- Full Security+ content.
- JSON schema generation.

## Decisions

- The guide lives at `docs/certification-authoring.md`.
- Scaffold usage is documented first, followed by manual schema/rubric details.
- Starter scaffold content is explicitly marked as placeholder material to replace before release.

## Scope

Changed:

- `docs/certification-authoring.md`
- `README.md`
- `CONTRIBUTING.md`

## Closeout

Acceptance criteria:

- [x] A new authoring guide exists in `docs/`.
- [x] The guide includes a complete per-file schema overview.
- [x] The guide includes ID examples for `a-plus`, `network-plus`, and `security-plus`.
- [x] The guide explains required vs optional files.
- [x] The guide explains how lesson image paths and alt text are validated.
- [x] The guide includes a content originality policy.
- [x] The guide includes a pre-PR checklist.
- [x] Existing contributor docs link to it.

Evidence:

```text
npm run validate:content
✓ Content valid

npm run build
✓ built
```

Audit:

- `audits/AUDIT-2026-06-16-true-cert-factory.md`
