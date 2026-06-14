# SkillForge Academy

Offline-first certification learning and exam-preparation software.

Current track: CompTIA A+.

> SkillForge Academy was previously developed under the working name Apex A+ Academy.

[![Tauri](https://img.shields.io/badge/Tauri_2-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Windows](https://img.shields.io/badge/Windows_10%2F11-0078D4?style=for-the-badge&logo=windows11&logoColor=white)](#system-requirements)

---

## Why SkillForge Academy?

CompTIA A+ preparation often means jumping between notes, flashcard sites, video courses, and generic quiz tools. SkillForge Academy brings those workflows together in a fast desktop application designed around active recall and measurable progress.

- **Study offline** with local-first learner data and no required account.
- **Practice real decisions** through original troubleshooting and support scenarios.
- **Target weak domains** with objective-level accuracy and readiness analytics.
- **Remember more** using a spaced-repetition recall deck.
- **Stay focused** in a polished environment built specifically for A+ preparation.

## Screenshots

Screenshots will be added as the public UI stabilizes.

Planned:

- Dashboard
- Learning path view
- Flashcard review
- Mock exam results
- PBQ/practice lab flow

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

### Mock Exams

Sit a full-length, timed, domain-weighted exam for `220-1201` or `220-1202`. Questions are drawn in proportion to the real objective weights, the timer counts down and auto-submits at zero, and there is no feedback until you finish — then you get a pass/fail result against a 75% line, a per-domain breakdown, and a full review.

### Performance-Based Questions

Beyond multiple choice, practice interactive **matching** (assign items to categories) and **ordering** (sequence steps) questions in a dedicated PBQ Lab or at the start of mock exams. Each simulation is graded with partial credit and includes an explanation.

### Spaced-Repetition Flashcards

Rate each recall as Again, Hard, Good, or Easy. SkillForge automatically schedules the card's next review interval so difficult material returns sooner.

### Performance Analytics

Track score history, domain accuracy, question attempts, session duration, personal bests, and readiness signals over time.

### Notes and Saved Questions

Create a private technical knowledge base for commands, ports, troubleshooting sequences, mnemonics, and concepts that need another pass.

### Global Search and Focused Drills

Press `Ctrl+K` to search domains, objectives, practice explanations, answers, and flashcards. Search results and learning paths can launch drills scoped to a single weak domain.

### Progress Backup

Export learner progress, notes, bookmarks, settings, daily activity, and spaced-repetition scheduling as a passphrase-protected portable backup. AES-256-GCM encryption keeps cross-device transfers private, while legacy plain JSON backups remain importable.

### Private by Design

Progress is stored locally through the Rust backend. The app does not require a cloud account or send learner activity to an external service.

## Exam Coverage

SkillForge Academy is organized around the current CompTIA A+ V15 exam series:

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
SkillForgeAcademy/
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

**Latest stable build:** [SkillForge Academy 1.3.1 (Windows x64 installer)](https://github.com/ForgeWireLabs/skillforge-academy/releases/download/v1.3.1/SkillForge.Academy_1.3.1_x64-setup.exe) · [all releases](https://github.com/ForgeWireLabs/skillforge-academy/releases)

> `1.3.0` is the first release under the SkillForge Academy name. Earlier installers were published as `Apex A+ Academy_*` (e.g. `Apex A+ Academy_1.2.1_x64-setup.exe`).

Download the `.exe`, run it, and follow the prompts. Because the build is not yet code-signed, Windows SmartScreen may show an unrecognized-publisher warning — choose **More info → Run anyway**. To sign your own builds and remove that warning, see [docs/CODE-SIGNING.md](docs/CODE-SIGNING.md).

A SHA-256 checksum is attached to each release as `SHA256SUMS.txt`. Verify your download in PowerShell:

```powershell
Get-FileHash ".\SkillForge.Academy_1.3.1_x64-setup.exe" -Algorithm SHA256
```

## Development

### Prerequisites

- [Node.js LTS](https://nodejs.org/)
- [Rust stable](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites for Windows](https://v2.tauri.app/start/prerequisites/)

### Start the Desktop App

```powershell
git clone https://github.com/ForgeWireLabs/skillforge-academy.git
cd skillforge-academy
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
npm run validate:a11y      # checks required keyboard/accessibility affordances
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

### Upgrading from Apex A+ Academy

The rename to SkillForge Academy **does not move or reset existing learner data**. The application identifier (`com.apexlearning.aplusacademy`), the browser `localStorage` key (`apex-state`), and the encrypted backup format/extension (`.apexbackup`) are intentionally unchanged, so the renamed app reads the same local data directory and imports older backups without conversion. Because the Windows installer's product name changes, the new build installs alongside any existing "Apex A+ Academy" entry rather than replacing it — both share the same saved progress, and the old entry can be uninstalled safely.

## Project status

SkillForge Academy is an active desktop MVP. The CompTIA A+ track is usable today, while content depth, accessibility testing, installer trust, and additional certification tracks remain ongoing work.

## Roadmap

Shipped:

- Objective/command search with a `Ctrl K` command palette
- Encrypted backup restore and cross-device transfer with legacy JSON import support
- Content banks moved to validated JSON loaded by the desktop backend
- Spaced repetition upgraded to an SM-2 scheduler
- Expanded original banks with 88 questions, 36 flashcards, and 8 PBQs
- Dedicated PBQ simulations with matching, ordering, scoring, and explanations
- Configurable full-length mock exams with custom question, PBQ, and time limits
- Automated tagged Windows release builds and SHA-256 checksum publishing
- Skip navigation, visible keyboard focus, labelled landmarks, escape handling, and automated accessibility checks

Next:

- Continue expanding original assessment content and simulation formats
- Add installer code signing when a trusted Windows certificate is available
- Continue usability testing with keyboard-only and assistive-technology users

## Contributing

Issues and focused pull requests are welcome. Useful contributions include original practice scenarios, accessibility improvements, test coverage, documentation, and corrections to technical explanations.

Before contributing assessment content:

1. Write the question and explanation in your own words.
2. Do not submit recalled questions from a live certification exam.
3. Include the relevant exam, domain, objective, answer, and rationale.
4. Verify commands, ports, standards, and platform behavior against authoritative documentation.

## License

A project license has not yet been selected. Until a LICENSE file is published, default copyright applies.

## Trademark Notice

CompTIA, A+, and related marks are trademarks of CompTIA, Inc. SkillForge Academy is an independent educational project and is not affiliated with, sponsored by, or endorsed by CompTIA. Exam objectives and certification requirements may change; always compare your study plan with the official CompTIA materials.

---

<div align="center">
  <strong>Build knowledge. Practice judgment. Walk into the exam prepared.</strong>
</div>
