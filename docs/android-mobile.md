# Android Mobile Support

SkillForge Academy uses the same React, TypeScript, Rust, and Tauri 2 codebase
for desktop and Android. Android support must be initialized and run through the
Tauri mobile CLI path, not through a PWA, React Native fork, or separate web
mobile application.

## Current Status

The repository is prepared for Tauri Android development with mobile scripts and
Vite dev-server host support. The local Windows host has Java 17 and an Android
SDK root at `C:\Android\Sdk`, but `tauri android init` is currently blocked
because required Android SDK packages are not installed successfully in SDK
metadata.

Attempted NDK installs with `sdkmanager` created temporary package directories
but did not complete cleanly:

- `ndk;27.2.12479018` stopped after a connection reset while preparing CMake.
- `ndk;26.3.11579264` created a partial `C:\Android\Sdk\ndk\26.3.11579264`
  directory but did not produce `source.properties`. `npm run
  mobile:android:init` now finds that partial directory and fails while reading
  the missing file.
- A 2026-07-01 retry moved stale partial NDK/build-tools directories aside and
  confirmed that `sdkmanager --list_installed` still lists only CMake, emulator,
  platform-tools, and the Android 35 x86_64 system image. Direct downloads from
  Google's Android repository are reachable but too slow in this host session to
  complete the 64 MB platform, 60 MB build-tools, and 665 MB NDK archives.

Do not treat Android launch, offline content loading, persistence, or backup
handoff as validated until the NDK install succeeds and the app has run on an
emulator or physical device.

## Host Prerequisites

- Java 17 or newer on `PATH`.
- Android SDK command-line tools, platform-tools, build-tools, platform, NDK,
  and an emulator or connected Android device.
- `ANDROID_HOME` and `ANDROID_SDK_ROOT` pointing at the SDK root.
- SDK tool paths available in the shell:

```powershell
$env:ANDROID_HOME = "C:\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Android\Sdk"
$env:PATH = "C:\Android\Sdk\platform-tools;C:\Android\Sdk\cmdline-tools\latest\bin;C:\Android\Sdk\emulator;$env:PATH"
```

Required SDK packages for the next retry:

```powershell
sdkmanager "platforms;android-35" "build-tools;35.0.0" "ndk;26.3.11579264" "cmake;3.22.1"
sdkmanager --list_installed
```

The Android SDK is usable for this work only when `sdkmanager --list_installed`
lists `platforms;android-35`, `build-tools;35.0.0`, and
`ndk;26.3.11579264`, and
`C:\Android\Sdk\ndk\26.3.11579264\source.properties` exists.

## Commands

Initialize Android project files:

```powershell
npm run mobile:android:init
```

Run on a connected device or selected emulator:

```powershell
npm run mobile:android:dev
```

Open the generated Android project in Android Studio:

```powershell
npm run mobile:android:studio
```

Build a test APK:

```powershell
npm run mobile:android:build
```

## Android Product Rules

- Keep the existing app identifier, `com.apexlearning.aplusacademy`, unless a
  store requirement forces a documented mobile-specific change. Preserving it
  protects upgrade and local-state expectations from the desktop rename.
- Keep bundled certification content offline-first. Android builds must load
  `certifications.json`, per-track JSON banks, PBQs, lessons, and SVG lesson
  assets without requiring a network after install.
- Keep `apex-state` browser fallback compatibility for frontend development and
  continue using the Rust state commands in Tauri builds.
- Keep `.apexbackup` export/import format compatibility with Windows and legacy
  JSON imports.

## Small-Screen Information Architecture

Android phones use the existing single-shell app with a drawer-style sidebar:

- The hamburger button opens the sidebar; all primary views stay in the same
  route-free shell.
- Track switching remains at the top of the drawer so A+, Network+, and
  Security+ progress remain visibly separate.
- The dashboard, learning paths, practice, PBQ Lab, mock setup, flashcards,
  analytics, notes, and preferences collapse to one-column layouts below the
  phone breakpoint.
- Domain navigation is hidden on narrow screens; the visible lesson/objective
  list becomes the primary study path inside the selected domain.
- Practice and mock review cards stack their controls and explanations so answer
  text, PBQ select controls, fill-in fields, and ordering controls have full
  width touch targets.
- Notes use a stacked list/editor layout so the virtual keyboard does not fight
  a fixed split-pane height.
- Dialogs and palettes use viewport-constrained widths and scrollable bodies.

## Android Storage And Backup Stance

Tauri state commands should continue to write `learner-state.json` through
`app.path().app_data_dir()`. On Android this resolves inside the app sandbox and
should be treated as private app data.

Encrypted backup export/import needs a platform handoff path rather than a raw
desktop-style file path. The preferred implementation is:

- Export: create the same `.apexbackup` envelope in the web layer, then hand it
  to an Android document/share flow.
- Import: receive a document-picker result or share intent, read the selected
  bytes, decrypt or parse through the existing `decryptBackup` and `migrateState`
  path, then persist through `save_state`.
- Permissions: request only document/share capabilities required for explicit
  user-selected files. Do not request broad storage access for normal learner
  state.

If Tauri core cannot provide the handoff, add a narrowly scoped Tauri mobile
plugin or follow-up work item for Android document/share integration.

## Validation Checklist

After Android initialization succeeds:

- `node scripts/validate-content.mjs --strict-coverage`
- `npm test -- --run`
- `npm run validate:a11y`
- `npm run build`
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `npm run mobile:android:dev`
- `npm run mobile:android:build`

Manual Android smoke:

- Launch the app on an emulator or physical device.
- Confirm the SkillForge shell renders without a blank WebView.
- Switch between A+, Network+, and Security+.
- Open domains, lessons with SVG assets, practice questions, PBQs, mock setup,
  flashcards, analytics, notes, and preferences.
- Disable network after install and confirm bundled content still loads.
- Change active track, answer a question, rate a flashcard, add a note, bookmark
  a question, close the app, reopen it, and confirm state survives.
- Export and import an encrypted `.apexbackup` once Android document/share
  handoff exists.
