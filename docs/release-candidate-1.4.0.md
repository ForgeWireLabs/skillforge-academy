# SkillForge Academy 1.4.0 Release Candidate Checklist

Date: 2026-06-22
Status: local release candidate; GitHub publication pending external billing resolution.

## Version Source Of Truth

- `package.json`: `1.4.0`
- `src-tauri/tauri.conf.json`: `1.4.0`
- `VERSION`: `1.4.0`
- Installer artifact: `src-tauri/target/release/bundle/nsis/SkillForge Academy_1.4.0_x64-setup.exe`

## Release Scope

SkillForge Academy 1.4.0 is the first multi-cert release candidate with:

- A+, Network+, and Security+ tracks.
- Objective-complete lessons and practice sets for all shipped tracks.
- Matching, ordering, and fill-in / command-entry PBQs.
- Expanded multi-select question coverage.
- Keyboard and accessibility guardrails from the 213 pass.

## Publication Plan

1. Confirm this checklist and `audits/AUDIT-2026-06-22-release-candidate-1.4.0.md`.
2. Confirm `CHANGELOG.md` has the `1.4.0` section.
3. Build locally with `npm run desktop:build`.
4. Generate `SHA256SUMS.txt` for the installer.
5. When GitHub billing is resolved, push tag `v1.4.0`.
6. Let `.github/workflows/release.yml` create the draft release.
7. Upload or verify `SkillForge Academy_1.4.0_x64-setup.exe` and `SHA256SUMS.txt`.
8. Publish the release after install/upgrade smoke checks are accepted.

## Rollback Plan

- Leave `v1.3.2` as the latest published stable until `v1.4.0` is accepted.
- If the `1.4.0` installer smoke fails, do not publish the GitHub release.
- If a draft `v1.4.0` release has been created, keep it as draft or delete the
  draft and fix forward from source.
- Learner data remains under the unchanged application identifier and should not
  be deleted during installer rollback or reinstall tests.

## Signing Status

Windows code signing remains blocked by work item 212 until a trusted
certificate is available. Unsigned installers are expected to trigger Windows
SmartScreen unrecognized-publisher warnings. User-facing recovery steps for
SmartScreen, launch, backups, and diagnostics are in
[Support And Troubleshooting](support-troubleshooting.md).

## Required Gates

- Refresh `docs/objective-drift-watch.md` and confirm the checked date is within
  the required release window before claiming current/objective-complete tracks.
- `node scripts/validate-content.mjs --strict-coverage`
- `npm test -- --run`
- `npm run validate:a11y`
- `npm run build`
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `npm run desktop:build`
- SHA-256 checksum generated for the installer
- Fresh install smoke
- Upgrade smoke from Apex A+ Academy or a documented host blocker
- Upgrade smoke from prior SkillForge version or a documented host blocker
