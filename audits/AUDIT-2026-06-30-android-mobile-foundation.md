# AUDIT-2026-06-30-android-mobile-foundation

## Summary

- **Type:** implementation / mobile readiness
- **Status:** blocked-with-repo-foundation
- **Related work:** `217-tauri-android-mobile-support-foundation`
- **Date:** 2026-06-30
- **Reviewer:** Codex, Desktop/Mobile Specialist lane

## Scope

Prepared the repository for Tauri Android support, checked local host
prerequisites, documented Android information architecture and storage behavior,
and ran the standard non-Android validation gates available on this Windows
host.

## Evidence

- `npm run tauri -- info` passed and reported Windows WebView2, MSVC, Rust,
  Node, npm, and Tauri package versions.
- `java -version` reported OpenJDK 17.0.19.
- `ANDROID_HOME` and `ANDROID_SDK_ROOT` pointed at `C:\Android\Sdk`.
- `sdkmanager --list_installed` reported Android Emulator, platform-tools, and
  the Android 35 x86_64 system image.
- `npm run tauri -- android init --ci` failed with
  `Android NDK not found. Make sure the NDK is installed and the NDK_HOME
  environment variable is set.`
- `sdkmanager "platforms;android-35" "build-tools;35.0.0"
  "ndk;27.2.12479018" "cmake;3.22.1"` failed after a connection reset while
  preparing CMake.
- `sdkmanager "ndk;26.3.11579264"` created a partial NDK directory but did not
  register an installed package or produce `source.properties`.
- `npm run mobile:android:init` then failed while reading the partial NDK:
  `Failed to open "C:\\Android\\Sdk\\ndk\\26.3.11579264\\source.properties"`.
- `npm run validate:content`, `npm run validate:a11y`, `npm test -- --run`,
  `npm run build`, `cargo fmt --check --manifest-path src-tauri/Cargo.toml`,
  and `cargo check --manifest-path src-tauri/Cargo.toml` passed.

## Findings

### Addressed: Android CLI entry points

`package.json` now exposes Tauri Android scripts for initialization, dev launch,
Android Studio handoff, and APK builds.

### Addressed: mobile dev-server host support

`vite.config.ts` now honors `TAURI_DEV_HOST` and configures HMR when Tauri
mobile dev commands provide a device-reachable host.

### Addressed: Android product stance

`docs/android-mobile.md` records the Tauri-only mobile architecture, host
prerequisites, commands, small-screen information architecture, storage stance,
backup handoff expectations, and post-init validation checklist.

### Addressed: phone-width usability rules

The CSS now adds a stricter phone breakpoint for stacked controls, full-width
PBQ inputs/selects, touch-sized PBQ ordering buttons, stacked review/actions,
single-column flashcard ratings, notes editor behavior, and viewport-constrained
menus/dialogs.

### Blocked: Android project initialization and runtime validation

The Android target could not be initialized because the local SDK lacks a
complete registered NDK. Android launch, offline content proof, persistence
proof, encrypted backup file handoff, and APK output remain unvalidated until
the NDK install succeeds.

## Acceptance Criteria Status

| AC | Status | Notes |
| --- | --- | --- |
| AC-1 | Blocked | Tauri Android init was attempted but blocked by missing/incomplete NDK. |
| AC-2 | Satisfied | Android CLI scripts and docs were added. |
| AC-3 | Blocked | Emulator/device launch cannot run until Android init succeeds. |
| AC-4 | Blocked | Offline content proof requires a runnable Android target. |
| AC-5 | Blocked | Android persistence proof requires a runnable Android target. |
| AC-6 | Satisfied | Android small-screen IA and phone-width touch rules are defined and patched. |
| AC-7 | Partially satisfied | Android storage/backup stance is defined; file handoff validation is blocked by Android init. |
| AC-8 | Partially satisfied | Standard local gates should be run after this audit; Android build gate is blocked by NDK. |

## Recommendation

Keep work item `217` blocked, not completed. The repository-side Android
foundation is in place, but the product acceptance criteria require a real
Tauri Android target and runtime proof. Resume by completing the Android NDK
install, then run `npm run mobile:android:init`, launch on an emulator/device,
validate offline content and learner state, and produce an APK.

## 2026-07-01 Retry Addendum

Related evidence: `evidence/runs/20260701-217-android-runtime-retry.json`.

- Moved stale partial NDK and build-tools directories aside after verifying they
  contained only installer metadata and no usable `source.properties`.
- `sdkmanager --list_installed` still lists only CMake, emulator,
  platform-tools, and the Android 35 x86_64 system image. It does not list
  `platforms;android-35`, `build-tools;35.0.0`, or `ndk;26.3.11579264`.
- Retried `sdkmanager` for the required platform/build-tools/NDK packages; the
  process stalled and left partial package-operation downloads.
- Direct downloads from Google's Android repository are reachable, but observed
  throughput was too slow for this run: the platform archive reached only about
  3.9 MB of 64.3 MB after roughly 2.5 minutes, and the required NDK archive is
  about 665 MB.
- `npm run mobile:android:init` still fails with `Android NDK not found. Make
  sure the NDK is installed and the NDK_HOME environment variable is set.`
- `adb devices` reported no connected/running devices. `emulator -list-avds`
  reports `forge_moto_one_hyper_lab_api35`, but runtime launch cannot proceed
  until the Android target is generated.

Updated recommendation: keep `217` blocked. The precise prerequisite is a
complete Android SDK install containing `platforms;android-35`,
`build-tools;35.0.0`, and `ndk;26.3.11579264`, with
`C:\Android\Sdk\ndk\26.3.11579264\source.properties` present.
