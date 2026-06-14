# Changelog

All notable changes to Apex A+ Academy are documented here.

## 1.1.0 - 2026-06-14

Download: [v1.1.0 release](https://github.com/DigitalHallucinations/apex-a-plus-academy/releases/tag/v1.1.0) (Windows x64 installer + SHA-256 checksum).

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
