# iOS Mobile Support

SkillForge Academy's iOS path uses the same React, TypeScript, Rust, and Tauri
2 codebase as desktop and Android. It is not a PWA, React Native fork, or
separate mobile application. The iOS target must be initialized and run through
the Tauri mobile CLI.

## Current Status

The repository now exposes first-class iOS scripts and shares the existing
mobile-aware Vite configuration, Tauri bundle identifier, iOS icon assets, and
Rust mobile entry point. Runtime iOS initialization is blocked on this Windows
host because Tauri iOS commands are only available on macOS hosts. The local
probe confirmed that this CLI installation exposes Android commands but no
`ios` subcommand on Windows.

Do not treat iOS launch, offline content loading, learner-state persistence, or
backup handoff as validated until the project is initialized and run on a macOS
host with Xcode.

## Source References

- [Tauri CLI reference](https://v2.tauri.app/reference/cli/) lists `ios init`,
  `ios dev`, `ios build`, and `ios run`, and notes that iOS commands are
  available only on macOS hosts.
- [Tauri Vite guide](https://v2.tauri.app/start/frontend/vite/) calls for
  `TAURI_DEV_HOST` handling when iOS physical devices need a reachable
  development server.
- [Tauri App Store distribution](https://v2.tauri.app/distribute/app-store/)
  requires macOS for iOS packaging and Apple Developer enrollment plus signing
  for distribution.
- [Tauri iOS code signing](https://v2.tauri.app/distribute/sign/ios/) covers
  Apple Developer and Apple-device requirements for iOS signing.

## Host Prerequisites

- macOS host.
- Xcode and Xcode command-line tools selected with `xcode-select`.
- Rust stable with iOS targets installed by Tauri or manually through `rustup`.
- Node.js and npm matching the project toolchain.
- Simulator runtime for iPhone and iPad validation.
- Apple Developer Program enrollment and signing/provisioning only for physical
  device, TestFlight, or App Store flows.

The Tauri CLI iOS commands are macOS-only. Run these checks on the macOS host:

```bash
npm run tauri -- info
npm run tauri -- ios --help
xcodebuild -version
xcrun simctl list devices available
rustup target list --installed
```

## Commands

Initialize iOS project files:

```bash
npm run mobile:ios:init
```

Run in Simulator or on a selected device:

```bash
npm run mobile:ios:dev
```

Build an iOS package:

```bash
npm run mobile:ios:build
```

Open the generated iOS project in Xcode:

```bash
npm run mobile:ios:xcode
```

For a physical iOS device, keep the existing Vite `TAURI_DEV_HOST` behavior.
Tauri sets the public development host when a device needs to reach the dev
server over the local network, and the app's Vite config already listens and
configures HMR from that environment variable.

## iOS Product Rules

- Keep the existing app identifier, `com.apexlearning.aplusacademy`, unless
  Apple provisioning forces a documented mobile-specific identifier.
- Keep bundled certification content offline-first. iOS builds must load
  `certifications.json`, per-track JSON banks, PBQs, lessons, and SVG lesson
  assets without requiring a network after install.
- Preserve `apex-state` browser fallback compatibility for frontend
  development and continue using the Rust state commands in Tauri builds.
- Keep `.apexbackup` export/import compatibility with Windows, Android design,
  and legacy JSON imports.
- Separate Simulator success, physical-device success, TestFlight readiness, and
  App Store readiness in evidence and release notes.

## Small-Screen Information Architecture

iOS uses the same single-shell app as desktop and Android:

- On iPhone widths, the sidebar is a drawer opened by the menu button.
- Safe-area insets are reserved around the app shell, drawer, sticky header,
  search palette, onboarding dialog, and track menu.
- Core study views remain route-free and collapse to one-column layouts below
  the phone breakpoint.
- Learning paths hide the domain rail on narrow screens and use the domain list
  as the primary path into lessons.
- Practice, PBQ, mock review, flashcard, analytics, notes, and preferences
  controls use full-width touch targets when space is tight.
- Notes use a stacked list/editor layout so the virtual keyboard has room and
  does not trap the editor behind fixed viewport heights.
- iPad and split-view widths should be tested around 768, 834, 1024, and 1112
  CSS pixels before claiming tablet readiness.

## iOS Storage And Backup Stance

The Rust state commands should continue to write `learner-state.json` through
`app.path().app_data_dir()`. On iOS this resolves inside the app container and
should be treated as private app data.

Encrypted backup export/import needs an iOS document handoff path rather than a
desktop-style raw file path:

- Export: create the same `.apexbackup` envelope in the web layer, then hand it
  to an iOS share sheet or document export flow.
- Import: receive a document-picker result or shared file, read the selected
  bytes, decrypt or parse through the existing `decryptBackup` and
  `migrateState` path, then persist through `save_state`.
- Permissions: request only user-initiated document/share capabilities. Do not
  request broad file access for normal learner state.

If Tauri core cannot provide the handoff, add a narrowly scoped Tauri mobile
plugin or follow-up work item for iOS document picker/share-sheet integration.

## Signing And Distribution

Simulator development can proceed on macOS with Xcode without App Store
submission. Physical-device testing, TestFlight, and App Store distribution add
Apple signing and provisioning requirements.

- Apple Developer Program enrollment is required for distribution and may be
  required for the device-signing flow used by the team.
- The Apple bundle identifier must match the identifier in
  `src-tauri/tauri.conf.json` unless a documented provisioning change is made.
- iOS code signing, provisioning profiles, certificates, and App Store Connect
  setup are separate from Windows code-signing work item `212`.
- TestFlight/App Store submission should be tracked as a release item after
  Simulator/device runtime proof exists.

## Validation Checklist

Run these repo gates before and after iOS target generation:

```bash
node scripts/validate-content.mjs --strict-coverage
npm test -- --run
npm run validate:a11y
npm run build
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
```

Manual iOS smoke after `mobile:ios:init` succeeds:

- Launch the app in iPhone and iPad Simulator.
- Confirm the SkillForge shell renders without a blank WebView.
- Switch between A+, Network+, and Security+.
- Open domains, lessons with SVG assets, practice questions, PBQs, mock setup,
  flashcards, analytics, notes, and preferences.
- Disable network after install and confirm bundled content still loads.
- Change active track, answer a question, rate a flashcard, add a note, bookmark
  a question, close the app, reopen it, and confirm state survives.
- Export and import an encrypted `.apexbackup` once iOS document/share handoff
  exists.
