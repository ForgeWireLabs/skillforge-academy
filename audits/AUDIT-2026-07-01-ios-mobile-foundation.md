# AUDIT-2026-07-01-ios-mobile-foundation

## Summary

- **Type:** implementation / mobile readiness
- **Status:** blocked-with-repo-foundation
- **Related work:** `218-tauri-ios-mobile-support-foundation`
- **Date:** 2026-07-01
- **Reviewer:** Codex, Desktop/Mobile Specialist lane

## Scope

Advanced work item `218` as far as the Windows host allowed: added iOS Tauri
script entry points, documented the iOS host/build/signing path, tightened
safe-area and phone-width layout rules shared by iOS, and ran available local
validation gates.

## Evidence

- `npm run mobile:ios:init` failed on Windows because the installed Tauri
  CLI did not expose an `ios` subcommand.
- `npm run tauri -- --help` listed `android` but not `ios`, matching Tauri's
  macOS-only iOS command availability.
- `npm run tauri -- info` passed and reported the Windows host, Rust, Node, npm,
  and Tauri package versions.
- `rustup target list --installed` reported only Windows and Linux targets; no
  iOS Rust target is installed on this host.
- `npm run validate:content`, `node scripts/validate-content.mjs
  --strict-coverage`, `npm run validate:a11y`, `npm test -- --run`, `npm run
  build`, `cargo fmt --check --manifest-path src-tauri/Cargo.toml`, and `cargo
  check --manifest-path src-tauri/Cargo.toml` passed after the repo changes.
- `python -m repopact_cli validate` still fails on the repo-wide
  preflight-marker requirement affecting active, blocked, and completed work
  items.

## Findings

### Addressed: iOS CLI entry points

`package.json` now exposes Tauri iOS scripts for initialization, dev launch,
build, and Xcode handoff.

### Addressed: iOS product stance

`docs/ios-mobile.md` records the Tauri-only architecture, macOS/Xcode
prerequisites, commands, `TAURI_DEV_HOST` behavior, storage and backup stance,
small-screen rules, signing/provisioning requirements, and validation checklist.

### Addressed: iOS-safe layout foundation

The shared CSS now reserves iOS safe-area insets for the app shell, drawer,
sticky header, content, search palette, onboarding dialog, track menu, and
mobile overlays. Notes, PBQ controls, review actions, settings controls, and
small-screen dialogs keep touch-friendly stacked behavior from the Android pass.

### Blocked: iOS target initialization and runtime validation

Generated iOS project files, Simulator/device launch, offline content proof,
learner-state persistence proof, backup document/share handoff, and iOS package
output all require a macOS host with Xcode and the Tauri iOS CLI.

## Acceptance Criteria Status

| AC | Status | Notes |
| --- | --- | --- |
| AC-1 | Blocked | Tauri iOS initialization was attempted but is unavailable on this Windows host. |
| AC-2 | Satisfied | iOS CLI scripts and docs were added. |
| AC-3 | Blocked | Simulator/device launch requires macOS and Xcode. |
| AC-4 | Blocked | Offline content proof requires a runnable iOS target. |
| AC-5 | Blocked | iOS persistence proof requires a runnable iOS target. |
| AC-6 | Partially satisfied | iOS small-screen and safe-area rules are defined and shared CSS was patched; real iPhone/iPad validation remains blocked. |
| AC-7 | Partially satisfied | iOS storage/backup stance is defined; document/share handoff validation remains blocked. |
| AC-8 | Satisfied | Apple Developer, signing, provisioning, TestFlight, and App Store requirements are documented separately from 212. |
| AC-9 | Partially satisfied | Standard local gates passed; iOS dev/build gates are blocked by macOS/Xcode dependency. |

## Recommendation

Move work item `218` to blocked, not completed. The repository-side iOS
foundation is in place, but product acceptance requires a real Tauri iOS target
and runtime proof. Resume on macOS by running `npm run mobile:ios:init`, then
`npm run mobile:ios:dev` in iPhone and iPad Simulator, validating offline
content, learner state, and backup handoff before closing the item.
