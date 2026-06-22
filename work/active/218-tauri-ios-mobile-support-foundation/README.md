# 218 - Add Tauri iOS mobile support foundation

> **Status**: Active
> **Owners**: Desktop/Mobile Specialist lead; QA Specialist support.
> **Depends on**: 217.

## Intent

Bring SkillForge Academy to iOS through Tauri mobile directly, after the Android
foundation proves the mobile architecture. This work keeps the same React +
TypeScript + Rust/Tauri product and does not introduce a PWA, React Native app,
or separate mobile architecture.

The target is an iOS build that launches in Simulator or on device, loads all
bundled certification content offline, persists learner state locally, and runs
the core study workflows on iPhone and iPad class viewports.

## Source References

- Tauri v2 mobile development uses `tauri ios dev` and `tauri ios build`.
- Tauri's iOS/App Store distribution docs require macOS, Xcode, Apple Developer
  Program enrollment, and signing/provisioning for device or App Store flows.

## Scope

In scope:

- Initialize iOS support with the Tauri v2 mobile project layout.
- Add package scripts for iOS dev/build workflows.
- Configure development host behavior required by iOS Simulator or physical
  devices.
- Verify bundled content loading and local state persistence on iOS, including
  lesson assets and PBQ data with offline proof.
- Reuse and refine responsive/touch work from Android, including iOS safe areas,
  virtual keyboard behavior, and iPad split-space assumptions.
- Validate iOS file/storage behavior for local state and encrypted backup
  import/export under sandbox and document-picker rules.
- Document iOS prerequisites, signing/provisioning, Simulator flow, device flow,
  and known blockers.
- Identify whether TestFlight/App Store readiness needs a separate release item.

Out of scope:

- PWA/mobile web architecture.
- Android work already tracked by 217.
- App Store release submission unless explicitly added later.
- Apple Developer account purchase if not already available.
- Windows installer code signing; that remains 212.

## Implementation Plan

1. Confirm prerequisites.
   - macOS host available.
   - Xcode installed and command-line tools selected.
   - Rust iOS targets installed as required by Tauri.
   - Apple Developer account status known.
   - Simulator available; physical device optional but preferred.

2. Initialize iOS.
   - Run the Tauri mobile initialization command for iOS.
   - Commit generated iOS project files intentionally.
   - Keep bundle identity aligned with the product unless Apple provisioning
     requires a documented mobile-specific identifier.

3. Add scripts and docs.
   - Add `mobile:ios:dev` and `mobile:ios:build` or similarly named scripts.
   - Document Simulator and physical-device commands, including any
     `TAURI_DEV_HOST` handling needed for real devices.

4. Prove app boot.
   - Launch in iOS Simulator or on physical device.
   - Confirm app shell renders and no blank WebView appears.
   - Capture screenshot or terminal/device evidence.

5. Prove content loading.
   - Open A+, Network+, and Security+.
   - Confirm domains, lessons, questions, flashcards, and PBQs load offline.
   - Confirm bundled resource paths and lesson SVG assets work in the iOS app
     container.

6. Prove persistence.
   - Change active track.
   - Answer practice content.
   - Rate a flashcard.
   - Add note/bookmark/settings change.
   - Relaunch and confirm state survives.

7. Validate touch UX.
   - Test iPhone-size and iPad-size layouts.
   - Fix remaining mobile layout issues from Android work.
   - Pay special attention to safe areas, virtual keyboard, notes editor, modal
     focus, scroll containers, charts, PBQ controls, review screens, and iPad
     split-screen widths.

8. Handle backup/export/import.
   - Validate encrypted `.apexbackup` export/import through iOS-compatible file
     picker/document sharing behavior.
   - Identify the local state path and backup handoff path in the iOS app
     sandbox.
   - If plugin, entitlement, document picker, or share-sheet work is needed,
     implement if scoped; otherwise record a follow-up with exact requirements.

9. Document signing and distribution.
   - Record Apple Developer enrollment requirement.
   - Record signing/provisioning profile requirements.
   - Separate Simulator success, device success, TestFlight readiness, and App
     Store readiness so the repo does not imply more than was proven.

10. Validate.
   - `node scripts/validate-content.mjs --strict-coverage`
   - `npm test -- --run`
   - `npm run validate:a11y`
   - `npm run build`
   - `cargo fmt --check --manifest-path src-tauri/Cargo.toml`
   - `cargo check --manifest-path src-tauri/Cargo.toml`
   - iOS Simulator/device launch
   - iOS build command or documented macOS/Xcode/signing blocker

## Risks

- iOS work requires macOS and Xcode; this may not be executable from a Windows
  workstation.
- Physical-device and App Store distribution require Apple Developer enrollment
  and signing/provisioning.
- iOS file import/export may require additional Tauri plugin or native
  entitlement work.
- WebView safe-area, virtual keyboard, and scroll behavior may expose layout
  issues not seen on Android.

## Closeout

Close only when iOS is a real Tauri mobile target in the repo, the app has
launched in Simulator or on device, content and learner state work offline, core
study flows are usable on iPhone/iPad viewports, and iOS signing/distribution
requirements are documented with honest evidence.
