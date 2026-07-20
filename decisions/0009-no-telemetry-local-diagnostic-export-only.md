---
id: 0009
title: "No Telemetry; Local Diagnostic Export Only"
status: accepted
date: 2026-07-20
supersedes: []
---

# 0009: No Telemetry; Local Diagnostic Export Only

## Context

SkillForge Academy promises offline-first, private-by-design study. Support still
needs a way to diagnose failures (backup import errors, persistence issues,
content load problems) without quietly shipping learner data to a vendor.

Work item `225` required an explicit product stance and the smallest practical
support path that preserves that promise.

## Decision

1. **No telemetry.** The app does not phone home usage metrics, analytics events,
   or learner activity.
2. **No automatic crash reporting.** There is no opt-in or opt-out crash
   reporter that uploads stack traces or session data.
3. **Local diagnostic export only.** When a learner needs help, they can export a
   diagnostic JSON file from Preferences. The file stays on their device until
   they choose to share it.
4. **Default redaction.** Diagnostic exports omit display name and note text
   unless the learner explicitly opts in to include sensitive content.
5. **In-memory error ring.** Recent support-relevant failures are kept in memory
   for the current session so exports can include actionable context. They are
   not persisted and are never uploaded automatically.

## Consequences

- Support docs must teach users how to export and share diagnostics deliberately.
- Future crash-reporting or telemetry proposals need a new decision that
  supersedes this one.
- Privacy/security review (`227`) should treat diagnostic redaction and the
  no-upload stance as invariants to verify.
