<#
.SYNOPSIS
  Diagnose and optionally repair the Android SDK package prerequisites for SkillForge Academy Tauri Android work item 217.

.DESCRIPTION
  This script is intentionally Windows-first because the current 217 blocker was observed on a Windows host using C:\Android\Sdk.
  It checks the exact SDK packages required before `npm run mobile:android:init` can succeed:

  - platforms;android-35
  - build-tools;35.0.0
  - ndk;26.3.11579264
  - cmake;3.22.1

  It also detects the known bad state where a partial NDK directory exists but
  C:\Android\Sdk\ndk\26.3.11579264\source.properties is missing.

  By default this script is read-only. Use -Repair to accept licenses, move aside
  stale partial directories, and run sdkmanager installs. Use -CleanPartial with
  -Repair to move known partial package directories aside before installation.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/android-sdk-doctor.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/android-sdk-doctor.ps1 -Repair -CleanPartial
#>

[CmdletBinding()]
param(
    [string]$SdkRoot = $env:ANDROID_SDK_ROOT,
    [switch]$Repair,
    [switch]$CleanPartial
)

$ErrorActionPreference = "Stop"

$RequiredPackages = @(
    "platforms;android-35",
    "build-tools;35.0.0",
    "ndk;26.3.11579264",
    "cmake;3.22.1"
)

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "== $Title =="
}

function Resolve-SdkRoot {
    param([string]$Candidate)

    if (-not [string]::IsNullOrWhiteSpace($Candidate)) {
        return $Candidate
    }

    if (-not [string]::IsNullOrWhiteSpace($env:ANDROID_HOME)) {
        return $env:ANDROID_HOME
    }

    return "C:\Android\Sdk"
}

function Find-SdkManager {
    param([string]$Root)

    $Candidates = @(
        (Join-Path $Root "cmdline-tools\latest\bin\sdkmanager.bat"),
        (Join-Path $Root "cmdline-tools\bin\sdkmanager.bat"),
        (Join-Path $Root "tools\bin\sdkmanager.bat")
    )

    foreach ($Candidate in $Candidates) {
        if (Test-Path $Candidate) {
            return $Candidate
        }
    }

    $FromPath = Get-Command sdkmanager.bat -ErrorAction SilentlyContinue
    if ($FromPath) {
        return $FromPath.Source
    }

    $FromPathNoBat = Get-Command sdkmanager -ErrorAction SilentlyContinue
    if ($FromPathNoBat) {
        return $FromPathNoBat.Source
    }

    return $null
}

function Get-InstalledPackages {
    param([string]$SdkManager)

    $Output = & $SdkManager --list_installed 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "sdkmanager --list_installed failed:`n$Output"
    }

    return $Output
}

function Test-PackageListed {
    param(
        [string[]]$InstalledOutput,
        [string]$PackageName
    )

    $Escaped = [regex]::Escape($PackageName)
    return ($InstalledOutput -match "^\s*$Escaped\s*\|").Count -gt 0
}

function Move-IfPartial {
    param(
        [string]$Path,
        [string]$RequiredMarker
    )

    if ((Test-Path $Path) -and -not (Test-Path $RequiredMarker)) {
        $Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $Destination = "$Path.partial-$Stamp"
        Move-Item -LiteralPath $Path -Destination $Destination
        Write-Host "Moved partial package directory: $Path -> $Destination"
    }
}

$SdkRoot = Resolve-SdkRoot -Candidate $SdkRoot
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot

$SdkManager = Find-SdkManager -Root $SdkRoot
$NdkRoot = Join-Path $SdkRoot "ndk\26.3.11579264"
$NdkSourceProperties = Join-Path $NdkRoot "source.properties"
$PlatformRoot = Join-Path $SdkRoot "platforms\android-35"
$BuildToolsRoot = Join-Path $SdkRoot "build-tools\35.0.0"
$CMakeRoot = Join-Path $SdkRoot "cmake\3.22.1"

Write-Section "Android SDK environment"
Write-Host "ANDROID_HOME     = $env:ANDROID_HOME"
Write-Host "ANDROID_SDK_ROOT = $env:ANDROID_SDK_ROOT"
Write-Host "SDK root exists  = $(Test-Path $SdkRoot)"
Write-Host "sdkmanager       = $SdkManager"

if (-not $SdkManager) {
    throw "Could not find sdkmanager. Install Android SDK command-line tools or add cmdline-tools\latest\bin to PATH."
}

Write-Section "Known package directories"
Write-Host "platforms/android-35 exists        = $(Test-Path $PlatformRoot)"
Write-Host "build-tools/35.0.0 exists          = $(Test-Path $BuildToolsRoot)"
Write-Host "ndk/26.3.11579264 exists           = $(Test-Path $NdkRoot)"
Write-Host "ndk source.properties exists       = $(Test-Path $NdkSourceProperties)"
Write-Host "cmake/3.22.1 exists                = $(Test-Path $CMakeRoot)"

if ($Repair -and $CleanPartial) {
    Write-Section "Cleaning partial package directories"
    Move-IfPartial -Path $NdkRoot -RequiredMarker $NdkSourceProperties
    Move-IfPartial -Path $BuildToolsRoot -RequiredMarker (Join-Path $BuildToolsRoot "source.properties")
    Move-IfPartial -Path $PlatformRoot -RequiredMarker (Join-Path $PlatformRoot "android.jar")
    Move-IfPartial -Path $CMakeRoot -RequiredMarker (Join-Path $CMakeRoot "bin\cmake.exe")
}

if ($Repair) {
    Write-Section "Accepting Android SDK licenses"
    $LicenseOutput = "y`ny`ny`ny`ny`ny`ny`ny`ny`ny`n" | & $SdkManager --licenses 2>&1
    Write-Host $LicenseOutput

    Write-Section "Installing required packages"
    & $SdkManager @RequiredPackages
    if ($LASTEXITCODE -ne 0) {
        throw "sdkmanager package install failed with exit code $LASTEXITCODE. Re-run this script after network/cache issues are resolved."
    }
}

Write-Section "Installed package metadata"
$Installed = Get-InstalledPackages -SdkManager $SdkManager
$Installed | ForEach-Object { Write-Host $_ }

Write-Section "217 required package status"
$Missing = New-Object System.Collections.Generic.List[string]
foreach ($Package in $RequiredPackages) {
    $Present = Test-PackageListed -InstalledOutput $Installed -PackageName $Package
    Write-Host ("{0,-24} {1}" -f $Package, $(if ($Present) { "OK" } else { "MISSING" }))
    if (-not $Present) {
        $Missing.Add($Package)
    }
}

if (-not (Test-Path $NdkSourceProperties)) {
    $Missing.Add("ndk source.properties")
    Write-Host "ndk source.properties       MISSING ($NdkSourceProperties)"
} else {
    Write-Host "ndk source.properties       OK ($NdkSourceProperties)"
}

Write-Section "Next command"
if ($Missing.Count -eq 0) {
    Write-Host "Android SDK prerequisites look ready for work item 217."
    Write-Host "Run: npm run mobile:android:init"
    exit 0
}

Write-Warning "Android SDK prerequisites are still incomplete: $($Missing -join ', ')"
if (-not $Repair) {
    Write-Host "Run repair mode: powershell -ExecutionPolicy Bypass -File scripts/android-sdk-doctor.ps1 -Repair -CleanPartial"
}
exit 1
