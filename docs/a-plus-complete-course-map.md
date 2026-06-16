# CompTIA A+ Complete Course Map

**Status:** Full-course architecture draft  
**Date:** 2026-06-16  
**Related work:** `work/active/215-course-lessons-and-real-world-class-content/`  
**Model:** `docs/course-lesson-content-model.md`

This map turns the existing A+ learning path into a full course plan. It covers
all current A+ domains, all current lessons, required real-world class content,
guided labs, review paths, and PBQ tie-ins. It is intentionally broader than a
pilot slice: every A+ domain has an instructional plan.

## Course Overview

Course id: `aplus-course`  
Certification: `a-plus`  
Exams: `220-1201`, `220-1202`  
Audience: new and early-career IT support technicians  
Outcome: learners can explain, configure, troubleshoot, secure, and document
common endpoint, mobile, network, operating system, and support workflows.

Current inventory baseline:

| Exam | Domains | Lessons | Questions | PBQs |
| --- | ---: | ---: | ---: | ---: |
| 220-1201 | 5 | 20 | 74 | 4 |
| 220-1202 | 4 | 16 | 59 | 4 |
| Total | 9 | 36 | 133 | 8 |

## Course-Level Review Path

Each unit follows the same learning loop:

1. Read lessons in order.
2. Complete embedded checks for understanding.
3. Complete at least one scenario or guided lab.
4. Review linked flashcards.
5. Answer linked practice questions.
6. Complete linked PBQs when available.
7. Take a domain review.
8. Return weak objectives to lesson review.

Mock exams should remain readiness evidence, not the first teaching tool.

## Unit 1: Mobile Devices

Unit id: `aplus-u-mobile`  
Exam: `220-1201`  
Domain: `aplus-mobile`  
Weight: 13%

Learning outcomes:

- Identify field-replaceable laptop components and service boundaries.
- Diagnose laptop display, touch, wireless, port, dock, and power symptoms.
- Configure mobile connectivity and sharing options.
- Choose the correct accessory, adapter, or power setting for a user need.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-mobile-l1` | Laptop hardware components | Field-note on replaceable vs soldered parts; component identification check; scenario: quote an upgrade for a thin laptop. |
| `aplus-mobile-l2` | Displays and digitizers | Symptom-to-layer troubleshooting activity; worked example for dim display vs bad panel vs bad digitizer. |
| `aplus-mobile-l3` | Mobile connectivity | Radio selection drill; scenario: user cannot pair a headset or use cellular data on a laptop. |
| `aplus-mobile-l4` | Ports, accessories, and power | Dock/adapter selection lab; check on USB-C, Thunderbolt, DisplayPort Alt Mode, and USB-C PD. |

Guided labs:

- `aplus-lab-mobile-display-triage`: Given symptoms, identify whether the
  display, backlight, digitizer, webcam, antenna, hinge, or cable is suspect.
- `aplus-lab-mobile-connectivity-ticket`: Triage a laptop with disabled Wi-Fi,
  Bluetooth pairing failure, and a phone hotspot request.
- `aplus-lab-dock-and-power-selection`: Choose the correct dock, adapter, and
  power profile for mobile and desk workflows.

Review path:

- Flashcards: mobile hardware, display layers, mobile radios, port standards.
- Questions: all `aplus-mobile` questions.
- PBQ tie-in: new PBQ recommended for dock/adapter selection and display
  symptom matching.

## Unit 2: Networking

Unit id: `aplus-u-networking`  
Exam: `220-1201`  
Domain: `aplus-networking`  
Weight: 23%

Learning outcomes:

- Explain common ports, protocols, services, and secure alternatives.
- Compare Wi-Fi standards, bands, encryption, and capacity tradeoffs.
- Configure and harden a SOHO network.
- Use basic tools to diagnose addressing, DNS, reachability, and cable faults.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-networking-l1` | Common ports and protocols | Port memory drills; secure/insecure pair comparison; scenario: firewall rule request. |
| `aplus-networking-l2` | Wi-Fi standards and frequencies | Band-selection lab; interference scenario; check on WPA2/WPA3 and deprecated standards. |
| `aplus-networking-l3` | Configuring a SOHO network | Router setup walkthrough; DHCP/NAT/private-address scenario; hardening checklist. |
| `aplus-networking-l4` | Cables, connectors, and tools | Tool selection activity; cable tester vs toner probe vs loopback plug scenarios. |

Guided labs:

- `aplus-lab-common-port-firewall`: Choose allowed ports for HTTPS, SSH, DNS,
  RDP, SMB, mail, and web services.
- `aplus-lab-soho-router-hardening`: Configure SSID, encryption, admin
  password, DHCP reservations, WPS, firmware, and remote management.
- `aplus-lab-network-fault-triage`: Interpret `ipconfig`, APIPA, failed DNS,
  and failed ping symptoms.

Review path:

- Flashcards: ports, protocols, Wi-Fi standards, private IP ranges, tools.
- Questions: all `aplus-networking` questions.
- PBQ tie-in: `aplus-p01` port/protocol matching.
- New PBQs recommended: SOHO hardening ordering, network tool matching.

## Unit 3: Hardware

Unit id: `aplus-u-hardware`  
Exam: `220-1201`  
Domain: `aplus-hardware`  
Weight: 25%

Learning outcomes:

- Identify motherboard, CPU, RAM, storage, power, cooling, and expansion parts.
- Compare RAM, storage, RAID, and connector technologies.
- Select power supplies and cooling based on symptoms and requirements.
- Explain printer technologies, maintenance, and laser imaging sequence.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-hardware-l1` | Motherboards, CPUs, and expansion | Component labeling activity; compatibility scenario for motherboard, CPU, RAM, and PCIe. |
| `aplus-hardware-l2` | Memory and storage | Storage selection lab; RAID comparison exercise; symptoms of failing RAM vs drive. |
| `aplus-hardware-l3` | Power supplies and cooling | PSU sizing scenario; thermal shutdown triage; safety warning for PSUs. |
| `aplus-hardware-l4` | Printers | Printer technology comparison; laser imaging ordering; maintenance symptom map. |

Guided labs:

- `aplus-lab-pc-build-compatibility`: Choose compatible motherboard, CPU, RAM,
  storage, PSU, and case constraints.
- `aplus-lab-storage-and-raid-selection`: Pick HDD, SATA SSD, NVMe, RAID 0,
  RAID 1, RAID 5, or RAID 10 for different business needs.
- `aplus-lab-printer-maintenance`: Match output symptoms to toner, fuser,
  drum, rollers, printhead, or paper path actions.

Review path:

- Flashcards: form factors, RAM/storage, RAID, PSU connectors, printer steps.
- Questions: all `aplus-hardware` questions.
- PBQ tie-ins: `aplus-p02` laser imaging order, `aplus-p07` symptom/component
  matching.
- New PBQ recommended: PC build compatibility matching.

## Unit 4: Virtualization And Cloud

Unit id: `aplus-u-virtualization`  
Exam: `220-1201`  
Domain: `aplus-virtualization`  
Weight: 11%

Learning outcomes:

- Explain hypervisors, virtual machines, resource allocation, and firmware
  requirements.
- Compare IaaS, PaaS, SaaS, DaaS, public, private, hybrid, and community cloud.
- Explain shared responsibility, elasticity, measured service, and resource
  pooling.
- Distinguish containers from full virtual machines.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-virtualization-l1` | Hypervisors and virtual machines | Type 1 vs Type 2 comparison; firmware setting check; VM resource allocation scenario. |
| `aplus-virtualization-l2` | Cloud service models | Service-model sorting activity; scenario: choose SaaS/PaaS/IaaS for business needs. |
| `aplus-virtualization-l3` | Cloud deployment and shared resources | Shared responsibility exercise; deployment model comparison. |
| `aplus-virtualization-l4` | Containers vs. virtual machines | Container vs VM worked example; check on isolation, startup time, and OS kernel sharing. |

Guided labs:

- `aplus-lab-vm-planning`: Plan CPU, RAM, disk, network, and firmware settings
  for a technician lab VM.
- `aplus-lab-cloud-model-selection`: Match user requirements to SaaS, PaaS,
  IaaS, DaaS, public, private, hybrid, or community cloud.
- `aplus-lab-container-vs-vm`: Choose containers or VMs for realistic support
  and development scenarios.

Review path:

- Flashcards: hypervisor types, cloud models, cloud traits, containers.
- Questions: all `aplus-virtualization` questions.
- PBQ tie-in: new PBQ recommended for cloud model/deployment matching.

## Unit 5: Hardware Troubleshooting

Unit id: `aplus-u-hw-troubleshooting`  
Exam: `220-1201`  
Domain: `aplus-hw-troubleshooting`  
Weight: 28%

Learning outcomes:

- Apply the CompTIA troubleshooting methodology in order.
- Diagnose POST, boot, intermittent, thermal, power, display, storage, and RAM
  issues.
- Troubleshoot mobile, network, and printer symptoms from observable evidence.
- Document findings and verify fixes.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-hw-troubleshooting-l1` | The CompTIA troubleshooting method | Methodology ordering; ticket debrief; check on next best step. |
| `aplus-hw-troubleshooting-l2` | Diagnosing PC hardware symptoms | Symptom matrix for POST, beeps, BSOD, shutdown, SMART, and no display. |
| `aplus-hw-troubleshooting-l3` | Network connectivity faults | APIPA/DNS/gateway scenario; command-output interpretation. |
| `aplus-hw-troubleshooting-l4` | Printer problems | Repeating marks, smearing, jams, faded print, and spooler triage. |

Guided labs:

- `aplus-lab-troubleshooting-method`: Work through a ticket from user report to
  documented closeout using the six-step method.
- `aplus-lab-no-boot-diagnosis`: Triage no power, fans/no display, beep codes,
  no boot device, and OS boot failure.
- `aplus-lab-printer-output-diagnosis`: Diagnose output defects using symptom
  spacing, toner behavior, jam location, and printer type.

Review path:

- Flashcards: troubleshooting steps, POST indicators, network symptoms, printer
  symptoms.
- Questions: all `aplus-hw-troubleshooting` questions.
- PBQ tie-in: `aplus-p03` troubleshooting methodology ordering.
- New PBQs recommended: no-boot decision tree, printer output symptom matching.

## Unit 6: Operating Systems

Unit id: `aplus-u-os`  
Exam: `220-1202`  
Domain: `aplus-os`  
Weight: 28%

Learning outcomes:

- Compare Windows editions, features, tools, filesystems, and management areas.
- Use Windows command-line and GUI utilities for support tasks.
- Identify common Linux and macOS commands and features.
- Plan OS installation, partitioning, boot mode, deployment, and post-install
  steps.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-os-l1` | Windows editions and features | Edition selection scenario; domain join, BitLocker, Remote Desktop, and Hyper-V comparison. |
| `aplus-os-l2` | Windows tools and the command line | Tool selection activity; command-output interpretation; repair command checklist. |
| `aplus-os-l3` | Linux and macOS basics | Command matching; filesystem comparison; support boundaries for cross-platform environments. |
| `aplus-os-l4` | Installing and deploying operating systems | GPT/MBR and UEFI/BIOS decision lab; clean install vs repair vs in-place upgrade. |

Guided labs:

- `aplus-lab-windows-tool-selection`: Match Task Manager, Event Viewer, Device
  Manager, Services, Disk Management, System Configuration, and commands to
  support tasks.
- `aplus-lab-os-install-plan`: Choose partition style, boot mode, install type,
  backup step, driver step, and post-install validation.
- `aplus-lab-cross-platform-commands`: Match common Linux/macOS commands and
  file systems to technician tasks.

Review path:

- Flashcards: Windows editions, tools, commands, filesystems, install terms.
- Questions: all `aplus-os` questions.
- PBQ tie-in: `aplus-p06` Windows command-line tool matching.
- New PBQ recommended: OS installation decision sequence.

## Unit 7: Security

Unit id: `aplus-u-security`  
Exam: `220-1202`  
Domain: `aplus-security`  
Weight: 28%

Learning outcomes:

- Recognize social engineering, technical attacks, spoofing, and rogue devices.
- Apply authentication, MFA, authorization, least privilege, and identity
  controls.
- Harden workstations, networks, mobile devices, and physical spaces.
- Detect, remove, and prevent malware using the CompTIA process.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-security-l1` | Threats, attacks, and social engineering | Attack classification; scenario: user receives suspicious message and login prompt. |
| `aplus-security-l2` | Authentication and access control | MFA factor sorting; least privilege access review; account lifecycle scenario. |
| `aplus-security-l3` | Hardening devices and networks | Hardening checklist lab; wireless, firewall, encryption, patching, and physical controls. |
| `aplus-security-l4` | Malware identification and removal | Malware symptom triage; removal-order exercise; ransomware response scenario. |

Guided labs:

- `aplus-lab-social-engineering-triage`: Classify phishing, vishing, smishing,
  tailgating, shoulder surfing, and impersonation cases.
- `aplus-lab-workstation-hardening`: Apply patching, firewall, anti-malware,
  screen lock, encryption, local admin, and account control recommendations.
- `aplus-lab-malware-response`: Walk through quarantine, remediation, restore,
  scans, restore point, and user education.

Review path:

- Flashcards: attacks, MFA factors, hardening steps, malware types/removal.
- Questions: all `aplus-security` questions.
- PBQ tie-ins: `aplus-p04` social-engineering matching, `aplus-p05` malware
  removal ordering.
- New PBQ recommended: workstation hardening checklist.

## Unit 8: Software Troubleshooting

Unit id: `aplus-u-sw-troubleshooting`  
Exam: `220-1202`  
Domain: `aplus-sw-troubleshooting`  
Weight: 23%

Learning outcomes:

- Troubleshoot Windows boot, performance, driver, update, and system-file
  issues.
- Diagnose application crashes, permissions, compatibility, and update problems.
- Troubleshoot mobile OS, app, battery, performance, and connectivity symptoms.
- Recognize security symptoms that masquerade as software problems.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-sw-troubleshooting-l1` | Troubleshooting Windows problems | Safe Mode and recovery decision tree; BSOD/driver/update scenario. |
| `aplus-sw-troubleshooting-l2` | Application crashes and performance | Single-app vs system-wide triage; permissions, compatibility, repair/reinstall flow. |
| `aplus-sw-troubleshooting-l3` | Mobile OS and app issues | Battery and app behavior scenario; cache, permissions, updates, reset escalation. |
| `aplus-sw-troubleshooting-l4` | Recognizing security symptoms | Redirect/pop-up/ransomware symptom classification; isolate-and-escalate flow. |

Guided labs:

- `aplus-lab-windows-recovery`: Pick Startup Repair, System Restore, Safe Mode,
  SFC, DISM, CHKDSK, rollback, reset, or reinstall based on symptoms.
- `aplus-lab-application-triage`: Diagnose a crashing app using event logs,
  permissions, compatibility mode, updates, cache, repair, and reinstall.
- `aplus-lab-mobile-symptom-triage`: Work through fast battery drain, overheating,
  data use spikes, app crashes, and unexpected pop-ups.

Review path:

- Flashcards: recovery tools, app troubleshooting, mobile symptoms, security
  symptoms.
- Questions: all `aplus-sw-troubleshooting` questions.
- PBQ tie-in: new PBQ recommended for Windows recovery decision tree.

## Unit 9: Operational Procedures

Unit id: `aplus-u-operations`  
Exam: `220-1202`  
Domain: `aplus-operations`  
Weight: 21%

Learning outcomes:

- Use documentation, ticketing, asset records, change management, and rollback
  planning.
- Apply ESD, electrical, environmental, and disposal safety procedures.
- Communicate professionally and preserve confidentiality.
- Compare backup types and apply tested recovery strategy.

Lessons:

| Lesson id | Title | Class additions |
| --- | --- | --- |
| `aplus-operations-l1` | Documentation and change management | Change request walkthrough; rollback plan check; documentation artifact matching. |
| `aplus-operations-l2` | Safety and environmental controls | ESD and hazardous-material scenario; SDS and e-waste handling check. |
| `aplus-operations-l3` | Professionalism and communication | Role-play ticket conversation; confidentiality and escalation scenarios. |
| `aplus-operations-l4` | Backup and disaster recovery | Backup type comparison; 3-2-1 planning lab; test restore debrief. |

Guided labs:

- `aplus-lab-change-management`: Draft scope, risk, approval, test plan,
  communication, maintenance window, rollback, validation, and closeout.
- `aplus-lab-safe-workbench`: Choose ESD controls, lifting practices, disposal
  steps, and safety exceptions for different service tasks.
- `aplus-lab-backup-recovery-plan`: Choose full, incremental, differential,
  synthetic full, cloud/off-site, and restore-test steps for user data.

Review path:

- Flashcards: change management, ESD, SDS, professionalism, backup types.
- Questions: all `aplus-operations` questions.
- PBQ tie-in: `aplus-p08` controlled production change ordering.
- New PBQ recommended: backup strategy selection.

## PBQ Coverage Matrix

| PBQ | Current domain | Course tie-in |
| --- | --- | --- |
| `aplus-p01` | Networking | Unit 2, common ports and protocols review. |
| `aplus-p02` | Hardware | Unit 3, printer imaging process review. |
| `aplus-p03` | Hardware Troubleshooting | Unit 5, troubleshooting methodology review. |
| `aplus-p04` | Security | Unit 7, social-engineering recognition review. |
| `aplus-p05` | Security | Unit 7, malware-removal procedure review. |
| `aplus-p06` | Operating Systems | Unit 6, Windows command-line tools review. |
| `aplus-p07` | Hardware | Unit 3 and Unit 5, hardware symptom diagnosis. |
| `aplus-p08` | Operational Procedures | Unit 9, change-management workflow. |

Recommended PBQ additions:

- Mobile display and dock selection.
- SOHO router hardening.
- Network tool selection and command-output triage.
- PC build compatibility.
- Cloud model and deployment matching.
- No-boot decision tree.
- Printer output symptom matching.
- OS installation decision sequence.
- Workstation hardening checklist.
- Windows recovery decision tree.
- Backup strategy selection.

## Assessment And Readiness Rules

- Lesson checks verify comprehension inside the course.
- Domain questions verify recall and applied understanding.
- PBQs verify procedural and scenario performance.
- Mock exams verify exam readiness.
- Analytics should show lesson completion separately from assessment readiness.

Minimum unit completion recommendation:

- All unit lessons completed.
- All lesson checks attempted.
- At least one unit lab completed.
- Linked flashcards reviewed.
- Domain question practice completed above target threshold.
- Linked PBQs completed when available.

## Authoring Backlog

To make the course map fully real in content files:

1. Add `courses.json` with `aplus-course`.
2. Add `units.json` for the nine units in this map.
3. Extend existing lesson records with `unitId`, `summary`, `level`,
   `prerequisites`, `outcomes`, vocabulary, examples, scenarios, checks, and
   assessment links.
4. Add `labs.json` with the guided labs listed above.
5. Add missing PBQs recommended by the coverage matrix.
6. Update validation to check all course, unit, lab, lesson, and link integrity.
7. Update learner state and UI to track unit, lesson, check, and lab progress.
