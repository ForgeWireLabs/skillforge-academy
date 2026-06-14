; SkillForge Academy NSIS installer hooks.
;
; Tauri's NSIS template only removes a previous install whose uninstall registry
; key matches the CURRENT product name ("SkillForge Academy"). The app was
; previously shipped as "Apex A+ Academy", whose uninstall entry lives under a
; different key, so without this hook the new installer would leave the old
; "Apex A+ Academy" entry installed alongside it.
;
; NSIS_HOOK_PREINSTALL runs before any files are copied. We look up the legacy
; product's uninstaller and run it silently so the two never coexist. Silent
; uninstall (/S) does NOT delete the application-data directory, and the data
; directory is keyed by the (unchanged) bundle identifier, so learner progress
; is preserved across the transition.

!macro NSIS_HOOK_PREINSTALL
  SetRegView 64
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Apex A+ Academy" "UninstallString"
  StrCmp $0 "" 0 apex_legacy_run
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Apex A+ Academy" "UninstallString"
  StrCmp $0 "" apex_legacy_done apex_legacy_run
  apex_legacy_run:
    DetailPrint "Removing the previous Apex A+ Academy installation..."
    ExecWait '$0 /S'
  apex_legacy_done:
!macroend
