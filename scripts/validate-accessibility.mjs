#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(join(root, "src", "App.tsx"), "utf8");
const styles = readFileSync(join(root, "src", "styles.css"), "utf8");
const checks = [
  [app.includes('className="skip-link"'), "Skip link is present"],
  [app.includes('id="main-content"'), "Main content landmark has a target"],
  [app.includes('aria-label="Primary navigation"'), "Primary navigation is labelled"],
  [app.includes("aria-current={view===item.id"), "Current navigation destination is exposed"],
  [app.includes('e.key === "Escape"'), "Escape closes transient overlays"],
  [styles.includes("*:focus-visible"), "Visible keyboard focus styling is present"]
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  console.error("Accessibility validation failed:");
  for (const [, message] of failed) console.error(`  - ${message}`);
  process.exit(1);
}
console.log(`Accessibility validation passed (${checks.length} checks).`);
