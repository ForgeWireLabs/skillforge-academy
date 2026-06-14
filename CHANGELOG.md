# Changelog

All notable changes to SkillForge Academy are documented here. SkillForge Academy was previously developed under the working name Apex A+ Academy.

## 1.3.0 - 2026-06-14

### Changed

- Renamed the product to **SkillForge Academy** (previously Apex A+ Academy). Existing learner data, settings, and encrypted backups carry over unchanged — the app-data location, browser storage key, and backup format are preserved.

### Added

- Multi-certification architecture: a certification manifest, per-track content directories, and a sidebar track switcher (CompTIA A+ is the first track).
- Per-certification progress — streaks, daily goals, and exam dates are tracked independently per track.
- All-tracks analytics overview alongside the per-track performance views.
- Exam toggles and mock-exam defaults are now driven by the certification manifest rather than hardcoded exam codes.

## 1.2.1 - 2026-06-14

### Added

- Dedicated PBQ Lab for standalone matching and ordering simulations
- Passphrase-protected AES-256-GCM backups for private cross-device transfer, with legacy JSON import support
- Custom mock exam question counts, PBQ counts, and time limits
- Automated Windows tag builds, draft GitHub releases, and SHA-256 checksum uploads
- Ten original questions, ten flashcards, and two additional PBQ scenarios
- Automated accessibility affordance validation

### Accessibility

- Skip-to-content navigation, labelled primary navigation and content regions, current-page semantics, visible focus rings, and Escape handling for transient overlays

### Performance

- Split charting dependencies and the Analytics screen into separate production chunks, removing the oversized initial-bundle warning

## 1.2.0 - 2026-06-13

Headline: full-length timed mock exams and performance-based questions, deepening the A+ track.

### Added

- Full-length **mock exam** mode: domain-weighted question selection that mirrors the exam blueprint, a countdown timer that auto-submits at zero, no per-question feedback until submission, a 75% pass line, and an end screen with pass/fail, per-domain breakdown, and full review
- **Performance-based questions (PBQs)**: a new interactive question type with *matching* (assign items to categories) and *ordering* (sequence steps) formats, graded with partial credit, surfaced at the start of mock exams
- Expanded original A+ question bank to 78 questions plus 6 PBQs, with per-domain depth for realistic weighting
- Mock attempts are tracked separately in analytics with a PASS/FAIL marker

### Changed

- Content pipeline, validator, and desktop resource loading now cover PBQs

## 1.1.0 - 2026-06-14

Download: [v1.1.0 release](https://github.com/ForgeWireLabs/skillforge-academy/releases/tag/v1.1.0) (Windows x64 installer + SHA-256 checksum).

### Added

- Global `Ctrl+K` command palette across domains, objectives, questions, and flashcards
- Focused practice sessions launched from domain recommendations and learning paths
- Accurate per-day question activity and consecutive-day study streak tracking
- Study-status notification panel for daily goals, due cards, and exam countdown
- Portable JSON progress backup, restore, and reset controls in Preferences
- Recency- and coverage-based domain and per-objective mastery analytics
- SM-2 spaced-repetition scheduling for flashcards, with ease and lapse tracking
- Question and flashcard banks moved to validated JSON loaded by the desktop backend (54 questions, 26 cards)
- Automated unit tests for scoring, streaks, scheduling, mastery, and state migration

### Fixed

- Daily mission progress no longer uses lifetime question totals
- Study streak now advances and resets correctly instead of holding a fixed value
- Bookmark controls now toggle instead of only adding items
- Checked practice answers can no longer be changed after revealing the explanation
- Practice answer options are shuffled to prevent positional memorization
- Saved learner state is validated and migrated on load, tolerating older or corrupt files

### Accessibility

- aria-labels on icon-only controls, keyboard-operable flashcards, and focus management on view changes

## 1.0.0 - 2026-06-13

- Initial Windows desktop release with learning paths, practice sessions, flashcards, analytics, notes, bookmarks, themes, local persistence, and NSIS packaging
