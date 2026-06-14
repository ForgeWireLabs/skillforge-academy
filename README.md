<div align="center">
  <img src="app-icon.svg" width="132" alt="Apex A+ Academy lightning bolt logo" />

  # Apex A+ Academy

  **A modern, offline-first CompTIA A+ study app for Windows.**

  Learn the objectives, practice technician scenarios, train with spaced repetition, and measure exam readiness in one focused desktop workspace.

  [![Tauri](https://img.shields.io/badge/Tauri_2-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
  [![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Windows](https://img.shields.io/badge/Windows_10%2F11-0078D4?style=for-the-badge&logo=windows11&logoColor=white)](#system-requirements)

  [Features](#features) | [Exam Coverage](#exam-coverage) | [Install](#install-and-run) | [Development](#development) | [Roadmap](#roadmap)
</div>

---

## Why Apex A+ Academy?

CompTIA A+ preparation often means jumping between notes, flashcard sites, video courses, and generic quiz tools. Apex A+ Academy brings those workflows together in a fast desktop application designed around active recall and measurable progress.

- **Study offline** with local-first learner data and no required account.
- **Practice real decisions** through original troubleshooting and support scenarios.
- **Target weak domains** with objective-level accuracy and readiness analytics.
- **Remember more** using a spaced-repetition recall deck.
- **Stay focused** in a polished environment built specifically for A+ preparation.

## Features

### Study Command Center

See exam readiness, daily goals, streaks, score trends, domain mastery, and the next recommended focus area from one dashboard.

### Structured Learning Paths

Explore every Core 1 and Core 2 domain by exam weight, topic group, objective, and knowledge check. The curriculum is organized for focused sessions instead of endless scrolling.

### Practice Lab

Build custom sessions for `220-1201`, `220-1202`, or both cores. Each original question includes:

- Difficulty and objective labels
- Immediate answer feedback
- Technician-focused explanations
- Question bookmarking
- Timed session tracking
- Detailed post-session review

### Spaced-Repetition Flashcards

Rate each recall as Again, Hard, Good, or Easy. Apex automatically schedules the card's next review interval so difficult material returns sooner.

### Performance Analytics

Track score history, domain accuracy, question attempts, session duration, personal bests, and readiness signals over time.

### Notes and Saved Questions

Create a private technical knowledge base for commands, ports, troubleshooting sequences, mnemonics, and concepts that need another pass.

### Global Search and Focused Drills

Press `Ctrl+K` to search domains, objectives, practice explanations, answers, and flashcards. Search results and learning paths can launch drills scoped to a single weak domain.

### Progress Backup

Export learner progress, notes, bookmarks, settings, daily activity, and spaced-repetition scheduling as a portable JSON backup from Preferences.

### Private by Design

Progress is stored locally through the Rust backend. The app does not require a cloud account or send learner activity to an external service.

## Exam Coverage

Apex A+ Academy is organized around the current CompTIA A+ V15 exam series:

| Exam | Domains covered |
| --- | --- |
| **Core 1: 220-1201** | Mobile Devices, Networking, Hardware, Virtualization and Cloud Computing, Hardware and Network Troubleshooting |
| **Core 2: 220-1202** | Operating Systems, Security, Software Troubleshooting, Operational Procedures |

The included practice material is original educational content. It does not contain exam dumps, recalled live exam questions, or proprietary CompTIA assessment content.

## Technology

| Layer | Technology | Purpose |
| --- | --- | --- |
| Desktop shell | Tauri 2 | Native Windows application and installer packaging |
| Backend | Rust | Durable local JSON persistence and desktop commands |
| Interface | React 19 + TypeScript | Responsive study, testing, and analytics workflows |
| Build system | Vite 8 | Fast development and optimized production builds |
| Data visualization | Recharts | Readiness trends and domain analytics |
| Icons | Lucide React | Consistent interface iconography |
| Installer | NSIS | Standard x64 Windows setup executable |

## Architecture

```text
ApexAPlus/
|-- src/                       React and TypeScript application
|   |-- App.tsx                Navigation and product workflows
|   |-- data.ts                Original domains, questions, and cards
|   |-- styles.css             Responsive dark and light themes
|   `-- types.ts               Learner and assessment data contracts
|-- src-tauri/                 Native desktop layer
|   |-- src/lib.rs             Rust persistence commands
|   |-- capabilities/          Tauri security permissions
|   `-- tauri.conf.json        Window and NSIS bundle configuration
|-- app-icon.svg               Source application artwork
`-- package.json               Frontend and desktop build commands
```

Learner state is written atomically to the operating system's application-data directory. Browser development mode falls back to `localStorage`, allowing frontend work without launching the desktop shell.

## Install and Run

### System Requirements

- Windows 10 or Windows 11, x64
- Microsoft Edge WebView2 Runtime, included with current Windows releases
- Approximately 100 MB of available disk space

### Installer

**Latest stable build:** [Apex A+ Academy 1.1.0 (Windows x64 installer)](https://github.com/DigitalHallucinations/apex-a-plus-academy/releases/download/v1.1.0/Apex.A+.Academy_1.1.0_x64-setup.exe) · [all releases](https://github.com/DigitalHallucinations/apex-a-plus-academy/releases)

Download the `.exe`, run it, and follow the prompts. Because the build is not yet code-signed, Windows SmartScreen may show an unrecognized-publisher warning — choose **More info → Run anyway**.

A SHA-256 checksum is attached to each release as `SHA256SUMS.txt`. Verify your download in PowerShell:

```powershell
Get-FileHash ".\Apex A+ Academy_1.1.0_x64-setup.exe" -Algorithm SHA256
```

## Development

### Prerequisites

- [Node.js LTS](https://nodejs.org/)
- [Rust stable](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites for Windows](https://v2.tauri.app/start/prerequisites/)

### Start the Desktop App

```powershell
git clone https://github.com/DigitalHallucinations/apex-a-plus-academy.git
cd apex-a-plus-academy
npm install
npm run desktop:dev
```

### Frontend-Only Development

```powershell
npm run dev
```

### Production Build

```powershell
npm run desktop:build
```

The optimized executable and NSIS installer are generated under:

```text
src-tauri/target/release/
src-tauri/target/release/bundle/nsis/
```

### Validation

```powershell
npm run validate:content   # schema-checks the question and flashcard banks
npm test                   # unit tests for scoring, streaks, scheduling, mastery
npm run build
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
```

## Data and Privacy

- No registration or learner account is required.
- Study history, notes, bookmarks, settings, and flashcard scheduling remain on the local computer.
- Generated learner data and build artifacts are excluded from source control.
- Removing the application does not necessarily remove its app-data directory; delete that directory separately when a complete data reset is required.

## Roadmap

Recently shipped:

- Objective/command search with a `Ctrl K` command palette
- Plain-JSON backup, restore, and progress reset in Preferences
- Content banks moved to validated JSON loaded by the desktop backend
- Spaced repetition upgraded to an SM-2 scheduler

Planned:

- Continue expanding the original question and flashcard banks
- Add dedicated performance-based question simulations
<<<<<<< HEAD
- Add encryption to the backup and restore flow
=======
- Support encrypted backup restore and cross-device transfer
>>>>>>> b8751f2663a3abb74f06d0731838d1920606524b
- Add configurable full-length mock exams
- Publish automated Windows release builds and checksums
- Continue improving keyboard navigation and accessibility coverage

## Contributing

Issues and focused pull requests are welcome. Useful contributions include original practice scenarios, accessibility improvements, test coverage, documentation, and corrections to technical explanations.

Before contributing assessment content:

1. Write the question and explanation in your own words.
2. Do not submit recalled questions from a live certification exam.
3. Include the relevant exam, domain, objective, answer, and rationale.
4. Verify commands, ports, standards, and platform behavior against authoritative documentation.

## Trademark Notice

CompTIA, A+, and related marks are trademarks of CompTIA, Inc. Apex A+ Academy is an independent educational project and is not affiliated with, sponsored by, or endorsed by CompTIA. Exam objectives and certification requirements may change; always compare your study plan with the official CompTIA materials.

---

<div align="center">
  <strong>Build knowledge. Practice judgment. Walk into the exam prepared.</strong>
</div>
