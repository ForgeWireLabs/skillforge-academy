# 217 - Add Tauri Android mobile support foundation

> **Status**: Active
> **Owners**: Desktop/Mobile Specialist lead; QA Specialist support.
> **Depends on**: none.

## Intent

Bring SkillForge Academy to Android through Tauri mobile directly. This is not a
PWA, not a separate React Native app, and not a temporary web-mobile branch. The
same React + TypeScript + Rust/Tauri product architecture remains the platform.

The first target is an installable Android build that can launch, load bundled
certification content offline, persist learner state locally, and support the
core study workflows on a phone-sized touch screen.

## Source References

- Tauri v2 prerequisites document Android Studio, JDK/JAVA_HOME, SDK/NDK, and
  mobile target setup requirements.
- Tauri v2 development docs use `tauri android dev` and
  `tauri android build` for mobile development and packaging.

## Scope

In scope:

- Initialize Android support with the Tauri v2 mobile project layout.
- Add package scripts for Android dev/build workflows.
- Adjust Vite/Tauri dev host configuration if required by Android device or
  emulator networking.
- Make bundled `src/content` loading work on Android, including lesson assets
  and PBQ data, with airplane-mode/offline proof after install.
- Verify local learner state persistence through the existing Rust/Tauri command
  surface or an Android-specific Tauri-compatible path.
- Define the Android small-screen information architecture: navigation pattern,
  touch target rules, sidebar behavior, chart simplification, virtual-keyboard
  behavior, and review/PBQ layout rules for phone and tablet breakpoints.
- Validate Android file/storage behavior for local state and encrypted backup
  import/export under sandbox rules.
- Document Android prerequisites and build/run instructions.
- Add Android-specific validation evidence and screenshots or emulator notes.

Out of scope:

- PWA/mobile web architecture.
- iOS support; tracked separately by 218.
- Play Store listing, paid signing, production distribution, or store review.
- Replacing the desktop app architecture.
- Broad redesign unrelated to mobile usability blockers.

## Implementation Plan

1. Confirm host prerequisites.
   - Android Studio installed.
   - Android SDK/NDK available.
   - Java/JDK path available (`JAVA_HOME`).
   - Rust Android targets installed as required by Tauri.
   - At least one emulator or physical device available.

2. Initialize Android.
   - Run the Tauri mobile initialization command for Android.
   - Commit generated Android project files intentionally.
   - Keep app identifier aligned with existing product identity unless a mobile
     store requirement forces a documented mobile-specific bundle id.

3. Add scripts and docs.
   - Add `mobile:android:dev` and `mobile:android:build` or similarly named
     scripts that call the Tauri Android CLI path.
   - Document emulator/device setup and known environment variables.

4. Prove app boot.
   - Launch on emulator/device.
   - Confirm splash/window shell renders.
   - Confirm no blank WebView, asset path, or CSP/resource failure.

5. Prove content loading.
   - Open each track.
   - Confirm A+, Network+, and Security+ domains, lessons, questions,
     flashcards, and PBQs are available offline.
   - Confirm lesson SVG assets render from the bundled package.
   - Run with network disabled after install if practical.

6. Prove persistence.
   - Change active track.
   - Complete at least one practice question.
   - Rate one flashcard.
   - Add a note and bookmark.
   - Close/reopen app and confirm state survives.

7. Make UI touch-usable.
   - Check small phone viewport and a tablet viewport.
   - Decide the mobile navigation model before patching: retained sidebar,
     drawer, bottom navigation, or another Tauri-friendly pattern.
   - Fix overflow, cramped navigation, safe areas, dialogs, PBQ controls, mock
     setup, analytics charts, review screens, virtual keyboard behavior, and
     notes editor as needed.
   - Preserve keyboard/accessibility affordances.

8. Handle backup/export/import.
   - Test encrypted `.apexbackup` export/import on Android.
   - Identify the local state path and backup handoff path in the Android app
     sandbox.
   - If Android file picker, share-sheet, storage integration, or permissions
     need a Tauri plugin or native change, implement it if scoped; otherwise
     record the blocker and exact next work item needed.

9. Validate.
   - `node scripts/validate-content.mjs --strict-coverage`
   - `npm test -- --run`
   - `npm run validate:a11y`
   - `npm run build`
   - `cargo fmt --check --manifest-path src-tauri/Cargo.toml`
   - `cargo check --manifest-path src-tauri/Cargo.toml`
   - Android dev launch on emulator/device
   - Android build command producing an APK/AAB or documented unsigned package

## Risks

- Android storage and file picker behavior may require Tauri plugins or
  platform-specific permissions.
- The current desktop-oriented layout may need nontrivial responsive work for
  analytics, notes, and exam review screens.
- Tauri Android builds depend on local SDK/NDK/JDK setup; if the host is missing
  prerequisites, record exact installation steps instead of guessing.
- Mobile packaging may expose assumptions in desktop resource loading.

## Closeout

Close only when Android is a real Tauri mobile target in the repo, the app has
launched on an Android emulator or device, content and learner state work
offline, core study flows are touch-usable, and the Android build path is either
green or blocked by a precisely documented external prerequisite.
