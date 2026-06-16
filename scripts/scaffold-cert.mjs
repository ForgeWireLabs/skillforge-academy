#!/usr/bin/env node
// Creates a starter certification manifest entry and minimal content banks.
// Example:
//   npm run scaffold:cert -- --id network-plus --prefix netplus --name "CompTIA Network+" --shortName "Network+" --exam N10-009 --examName "Network+"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "..", "src", "content");
const manifestPath = join(contentDir, "certifications.json");

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    out[key] = next && !next.startsWith("--") ? next : "true";
    if (out[key] === next) i++;
  }
  return out;
}

function required(opts, key) {
  if (!opts[key]) throw new Error(`Missing required --${key}`);
  return opts[key];
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const opts = args(process.argv.slice(2));
const id = required(opts, "id");
const idPrefix = required(opts, "prefix");
const exam = required(opts, "exam");
const name = opts.name || id;
const shortName = opts.shortName || name;
const vendor = opts.vendor || "CompTIA";
const examName = opts.examName || "";
const passThreshold = opts.passThreshold ? Number(opts.passThreshold) : 0.75;
const defaultQuestions = opts.defaultQuestions ? Number(opts.defaultQuestions) : 90;
const defaultMinutes = opts.defaultMinutes ? Number(opts.defaultMinutes) : 90;

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error("--id must be kebab-case");
if (!/^[a-z0-9]+$/.test(idPrefix)) throw new Error("--prefix must be lowercase letters/numbers without punctuation");
if (!Number.isFinite(passThreshold) || passThreshold <= 0 || passThreshold > 1) throw new Error("--passThreshold must be > 0 and <= 1");

const certDir = join(contentDir, id);
mkdirSync(certDir, { recursive: true });

const manifest = readJson(manifestPath);
if (!manifest.some(cert => cert.id === id)) {
  manifest.push({
    id,
    name,
    shortName,
    vendor,
    idPrefix,
    description: `${name} certification track. Replace this starter description before release.`,
    passThreshold,
    exams: [
      { id: exam, certId: id, name: examName, defaultQuestions, defaultMinutes }
    ]
  });
  writeJson(manifestPath, manifest);
}

const starterDomain = `${idPrefix}-starter`;
const files = {
  "domains.json": [
    {
      id: starterDomain,
      certId: id,
      exam,
      name: "Starter Domain",
      weight: 100,
      color: "#36d6b5",
      description: "Starter domain created by the certification scaffold. Replace with official objective domains before release.",
      topics: ["Replace with official objective topics"]
    }
  ],
  "questions.json": [
    {
      id: `${idPrefix}-q001`,
      certId: id,
      exam,
      domain: starterDomain,
      difficulty: "Foundation",
      prompt: "Starter question created by the certification scaffold. Replace before release.",
      options: ["Correct starter answer", "Incorrect starter answer"],
      answer: 0,
      explanation: "Starter explanation. Replace with original educational rationale before release.",
      objective: "Starter objective"
    }
  ],
  "flashcards.json": [
    {
      id: `${idPrefix}-f001`,
      certId: id,
      domain: starterDomain,
      front: "Starter flashcard prompt. Replace before release.",
      back: "Starter flashcard answer. Replace before release."
    }
  ],
  "pbqs.json": [],
  "lessons.json": []
};

for (const [file, value] of Object.entries(files)) {
  const path = join(certDir, file);
  if (!existsSync(path)) writeJson(path, value);
}

console.log(`Created certification scaffold for ${id}`);
console.log(`Next: replace starter content, then run npm run validate:content`);
