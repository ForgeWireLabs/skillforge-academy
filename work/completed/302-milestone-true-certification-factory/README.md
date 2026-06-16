# 302 — Milestone: True Certification Factory

> **Status**: ✅ Complete
> **Owners**: Codex (implementation).
> **Depends on**: 001, 002.

## Intent

Complete the platform milestone where adding a certification is primarily:

```text
manifest entry + content folder + optional assets -> validation -> build
```

## Decisions

- Certification content is discovered by manifest ID and folder convention.
- Desktop builds package the full content tree.
- Authoring rules are documented before large Network+ or Security+ content work begins.

## Scope

Milestone includes:

- `work/completed/001-true-cert-factory`
- `work/completed/002-cert-authoring-guide`

## Closeout

Milestone criteria:

- [x] Content factory implementation complete.
- [x] Authoring guide complete.
- [x] Validation, tests, frontend build, Rust checks, and desktop build pass.
- [x] Implementation audit added.

Evidence:

- `audits/AUDIT-2026-06-16-true-cert-factory.md`

