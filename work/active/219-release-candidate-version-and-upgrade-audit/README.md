# 219 - Release candidate, version, installer, and upgrade audit

> **Status**: Active
> **Owners**: Release/QA Specialist lead.
> **Depends on**: 305.

## Intent

Turn the current multi-cert build into a disciplined release candidate instead
of a pile of successful build commands. This item covers the missed release
details: version consistency, latest-stable docs, changelog cut, installer
upgrade behavior, checksums, smoke install, rollback notes, and honest signing
status.

## Scope

In scope:

- README latest-stable/current-release wording.
- `CHANGELOG.md`, `VERSION`, `package.json`, and `src-tauri/tauri.conf.json`
  version consistency.
- Windows installer upgrade behavior from Apex A+ Academy and previous
  SkillForge versions.
- Release-candidate checklist and release audit.
- Checksum generation/verification.

Out of scope:

- Buying/signing with a trusted certificate; 212 remains blocked.
- Mobile release distribution; Android/iOS are 217/218.

## Verification Plan

- `npm run desktop:build`
- Generate or verify SHA-256 checksums for produced installer.
- Fresh install smoke test.
- Upgrade smoke test from prior public installer if available.
- Backup/export/import smoke test.
- Uninstall/reinstall data behavior check.

## Closeout

Close when the release surface has one coherent version story, installer upgrade
behavior is proven, and a release audit records artifacts, checksums, smoke
results, signing status, and rollback guidance.
