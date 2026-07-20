#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(join(root, "src", "App.tsx"), "utf8");
const analytics = readFileSync(join(root, "src", "Analytics.tsx"), "utf8");
const styles = readFileSync(join(root, "src", "styles.css"), "utf8");
const checks = [
  [app.includes('className="skip-link"'), "Skip link is present"],
  [app.includes('id="main-content"'), "Main content landmark has a target"],
  [app.includes('aria-live="polite"'), "View changes are announced politely"],
  [app.includes('aria-label="Primary navigation"'), "Primary navigation is labelled"],
  [app.includes('aria-label="Tools navigation"'), "Tools navigation is labelled"],
  [app.includes('className="nav-section-label"'), "Tools section label is present"],
  [app.includes("aria-current={view===item.id"), "Current navigation destination is exposed"],
  [app.includes('e.key === "Escape"'), "Escape closes transient overlays"],
  [styles.includes("*:focus-visible"), "Visible keyboard focus styling is present"],
  [app.includes("inert={modalOpen"), "Open dialogs make the background inert (focus trap)"],
  [app.includes("useReturnFocus"), "Dialogs restore focus to their trigger on close"],
  [app.includes('role="dialog"') && app.includes('aria-modal="true"'), "Dialogs expose dialog role and modal state"],
  [app.includes("toggleRef.current?.focus()"), "Track switcher menu is keyboard-dismissable"],
  [app.includes('role={multi?"checkbox"'), "Multi-select options expose checkbox semantics"],
  [app.includes('role="status"'), "Status messages are exposed to assistive technology"],
  [app.includes('role="button"') && app.includes("tabIndex={0}") && app.includes('e.key==="Enter"||e.key===" "'), "Flashcards are keyboard-operable"],
  [app.includes('aria-label={`Categorize ${item.text}`'), "Categorization PBQ selects have item-specific labels"],
  [app.includes('aria-label="PBQ item feedback"'), "PBQ review feedback is labelled"],
  [app.includes("htmlFor={`fillin-${pbq.id}-${b.id}`") && app.includes("id={`fillin-${pbq.id}-${b.id}`"), "Fill-in PBQ inputs have associated labels"],
  [analytics.includes("aria-label={`Objective ${o.code}") && analytics.includes('aria-hidden="true"'), "Objective heatmap has spoken cell names and hidden visual legend"]
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  console.error("Accessibility validation failed:");
  for (const [, message] of failed) console.error(`  - ${message}`);
  process.exit(1);
}
console.log(`Accessibility validation passed (${checks.length} checks).`);
