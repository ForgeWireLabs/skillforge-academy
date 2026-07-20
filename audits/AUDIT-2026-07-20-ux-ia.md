# AUDIT-2026-07-20-ux-ia: UX And Information-Architecture Audit

Type: UX / information architecture
Status: passed-with-follow-ups
Date: 2026-07-20
Auditor: Cursor agent
Related Todo: `308`

## Scope

Cold walkthrough of SkillForge Academy journeys before learner beta (`228`
deferred). Identify flow blockers, IA/navigation issues, seam gaps, and polish.
Ship the highest-impact seam fix in this pass: scoped Practice handoffs from
Command Center and Learning Paths.

## Method

- Code walk of `src/App.tsx` views: onboarding, track switcher, Command Center,
  Learn, Practice, PBQ Lab, Mock, Recall, Notes, Preferences, search.
- Compared against the documented study loop in `docs/getting-started.md`.
- Implemented and tested Practice domain targeting + study-focus handoff.

## Journey scores

Legend: **Found** / **Hesitated** / **Failed** (pre-fix unless noted).

| Journey | Score | Notes |
| --- | --- | --- |
| First launch / onboarding | Found | Clear 4-step tour; track pick + study loop explained. |
| Daily “what next?” from Command Center | **Failed → Fixed** | Recommendation named a weak domain but CTA opened unscoped Practice. Now launches a domain-scoped drill. |
| Learn → Practice same domain | **Failed → Fixed** | “Practice this domain” only switched views. Now passes `StudyFocus`. |
| Practice session loop | Found | Setup → answer → explain → next → results is solid. |
| PBQ Lab | Hesitated | Separate top-level nav from Practice/Mock; easy to miss relation to exam PBQs. |
| Mock exam | Hesitated | Strong timed flow; weak remediation handoff after review (“what do I drill next?”). |
| Recall deck | Found | Rating loop is clear; empty-due state is understandable. |
| Track switch | Found | Progress isolation is clear; expandable switcher works. |
| Backup / diagnostics | Found | Documented; Preferences is dense but workable for power users. |

## Prioritized backlog

### P0 — Flow blockers (this pass)

1. **Recommendation CTA mismatch** — Fixed: Command Center button is now
   `Drill {domain}` and opens Practice scoped to that domain.
2. **Learn → Practice seam** — Fixed: domain/exam focus handed through
   `openPractice`; Practice setup shows domain focus chips + status notice.

### P1 — IA / navigation (follow-up `309`)

3. **Nine peer destinations** — Practice, PBQ Lab, and Mock feel like three quiz
   apps. Recommend primary Study group (Learn, Practice, Mock, Recall) vs
   secondary Tools (PBQ, Performance, Notes, Preferences) without a visual
   reskin in this pass.
4. **Command Center density** — Hero + daily mission + 4 stats + chart + domain
   list competes with “one next action.” Consider collapsing trend/domain into
   Performance once the CTA is trusted.
5. **PBQ discoverability** — Mention PBQs from Mock setup and/or Learn domain
   pages so Lab is not the only discovery path.

### P2 — Seam / remediation

6. **Mock results → drill** — After a mock, offer “Drill weakest domain” using
   the same `StudyFocus` path.
7. **Practice results → Learn** — Link misses back to the related lesson/objective.
8. **Objective-level practice** — Domain scope is step one; objective-scoped
   drills would match Learning Paths progress more tightly.

### P3 — Polish

9. Naming audit: Command Center / PBQ Lab / Recall Deck vs learner vocabulary.
10. Early empty states (no attempts, no exam date) could push a single CTA harder.
11. Preferences card density (profile/theme/backup/diagnostics/tour).

## IA recommendation (AC-5)

Do **not** reskin. Next IA pass (`309`) should:

1. Keep the study loop primary in the sidebar (Learn, Practice, Mock, Recall).
2. Demote or nest PBQ Lab, Performance, Notes, Preferences as secondary.
3. Keep Command Center as a router with one dominant next action (now fixed)
   and less competing chrome.

## Fixes shipped in `308`

- `practicePool()` for cert/exam/domain filtering.
- App-level `StudyFocus` + `openPractice()`.
- Practice setup domain focus chips; handoff status message.
- Command Center and Learn CTAs pass domain/exam focus.

## Release recommendation

Safe to continue `1.4.0` RC UX iteration. Defer beta (`228`) until at least the
P1 nav grouping follow-up is triaged or scheduled. Re-run a short cold walk after
`309`.

## Final Status

Passed-with-follow-ups. Work item `308` closes when evidence is registered;
remaining P1+ items tracked as `309`.
