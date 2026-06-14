#!/usr/bin/env node
// Validates the JSON content banks before they ship. Run with:
//   npm run validate:content
// The certifications.json manifest is the source of truth; each track's banks
// live under src/content/<certId>/ and are concatenated for validation.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "..", "src", "content");
const read = path => JSON.parse(readFileSync(join(contentDir, path), "utf8"));
const readOptional = path => { try { return read(path); } catch { return []; } };

const DIFFICULTIES = ["Foundation", "Intermediate", "Advanced"];

function validate(certifications, domains, questions, flashcards, pbqs) {
  const errors = [];

  // ---- Manifest ----
  const certIds = new Set();
  const prefixByCert = new Map();
  const examToCert = new Map();
  for (const c of certifications) {
    if (certIds.has(c.id)) errors.push(`Duplicate certification id: ${c.id}`);
    certIds.add(c.id);
    if (!c.idPrefix?.trim()) errors.push(`Certification ${c.id}: empty idPrefix`);
    else prefixByCert.set(c.id, c.idPrefix);
    for (const field of ["name", "shortName", "vendor"])
      if (!c[field]?.trim()) errors.push(`Certification ${c.id}: empty ${field}`);
    if (typeof c.passThreshold !== "number" || c.passThreshold <= 0 || c.passThreshold > 1)
      errors.push(`Certification ${c.id}: passThreshold must be between 0 and 1`);
    if (!Array.isArray(c.exams) || c.exams.length === 0) errors.push(`Certification ${c.id}: needs at least one exam`);
    for (const e of c.exams ?? []) {
      if (examToCert.has(e.id)) errors.push(`Duplicate exam id: ${e.id}`);
      examToCert.set(e.id, c.id);
      if (e.certId !== c.id) errors.push(`Exam ${e.id}: certId "${e.certId}" does not match certification "${c.id}"`);
      if (!Number.isFinite(e.defaultQuestions) || e.defaultQuestions <= 0) errors.push(`Exam ${e.id}: invalid defaultQuestions`);
      if (!Number.isFinite(e.defaultMinutes) || e.defaultMinutes <= 0) errors.push(`Exam ${e.id}: invalid defaultMinutes`);
    }
  }

  const checkCertRefs = (label, certId, id, exam) => {
    if (!certIds.has(certId)) errors.push(`${label}: unknown certId "${certId}"`);
    else {
      const prefix = prefixByCert.get(certId);
      if (prefix && !id.startsWith(`${prefix}-`)) errors.push(`${label}: id must start with "${prefix}-"`);
    }
    if (exam !== undefined) {
      if (!examToCert.has(exam)) errors.push(`${label}: invalid exam "${exam}"`);
      else if (certIds.has(certId) && examToCert.get(exam) !== certId)
        errors.push(`${label}: exam "${exam}" does not belong to cert "${certId}"`);
    }
  };

  const domainIds = new Set(domains.map(d => d.id));

  const seenD = new Set();
  for (const d of domains) {
    if (seenD.has(d.id)) errors.push(`Duplicate domain id: ${d.id}`);
    seenD.add(d.id);
    checkCertRefs(`Domain ${d.id}`, d.certId, d.id, d.exam);
  }

  const seenQ = new Set();
  for (const q of questions) {
    if (seenQ.has(q.id)) errors.push(`Duplicate question id: ${q.id}`);
    seenQ.add(q.id);
    checkCertRefs(`Question ${q.id}`, q.certId, q.id, q.exam);
    if (!domainIds.has(q.domain)) errors.push(`Question ${q.id}: unknown domain "${q.domain}"`);
    if (!DIFFICULTIES.includes(q.difficulty)) errors.push(`Question ${q.id}: invalid difficulty "${q.difficulty}"`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`Question ${q.id}: needs >= 2 options`);
    else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      errors.push(`Question ${q.id}: answer index ${q.answer} out of range`);
    for (const field of ["prompt", "explanation", "objective"])
      if (!q[field]?.trim()) errors.push(`Question ${q.id}: empty ${field}`);
  }

  const seenF = new Set();
  for (const f of flashcards) {
    if (seenF.has(f.id)) errors.push(`Duplicate flashcard id: ${f.id}`);
    seenF.add(f.id);
    checkCertRefs(`Flashcard ${f.id}`, f.certId, f.id);
    if (!domainIds.has(f.domain)) errors.push(`Flashcard ${f.id}: unknown domain "${f.domain}"`);
    for (const field of ["front", "back"])
      if (!f[field]?.trim()) errors.push(`Flashcard ${f.id}: empty ${field}`);
  }

  const seenP = new Set();
  for (const p of pbqs) {
    if (seenP.has(p.id)) errors.push(`Duplicate PBQ id: ${p.id}`);
    seenP.add(p.id);
    checkCertRefs(`PBQ ${p.id}`, p.certId, p.id, p.exam);
    if (!domainIds.has(p.domain)) errors.push(`PBQ ${p.id}: unknown domain "${p.domain}"`);
    if (p.kind === "matching") {
      const itemIds = new Set((p.items || []).map(i => i.id));
      const targetIds = new Set((p.targets || []).map(t => t.id));
      if (!(p.items || []).length || !(p.targets || []).length) errors.push(`PBQ ${p.id}: matching needs items and targets`);
      for (const id of itemIds) if (!(id in (p.answer || {}))) errors.push(`PBQ ${p.id}: item "${id}" has no answer`);
      for (const [item, target] of Object.entries(p.answer || {})) {
        if (!itemIds.has(item)) errors.push(`PBQ ${p.id}: answer references unknown item "${item}"`);
        if (!targetIds.has(target)) errors.push(`PBQ ${p.id}: answer references unknown target "${target}"`);
      }
    } else if (p.kind === "ordering") {
      const stepIds = new Set((p.steps || []).map(s => s.id));
      if ((p.answer || []).length !== (p.steps || []).length) errors.push(`PBQ ${p.id}: answer length must match steps`);
      for (const id of p.answer || []) if (!stepIds.has(id)) errors.push(`PBQ ${p.id}: answer references unknown step "${id}"`);
    } else {
      errors.push(`PBQ ${p.id}: unknown kind "${p.kind}"`);
    }
  }
  return errors;
}

const certifications = read("certifications.json");
const certIds = certifications.map(c => c.id);
const collect = file => certIds.flatMap(id => readOptional(join(id, file)));

const domains = collect("domains.json");
const questions = collect("questions.json");
const flashcards = collect("flashcards.json");
const pbqs = collect("pbqs.json");
const errors = validate(certifications, domains, questions, flashcards, pbqs);

if (errors.length) {
  console.error(`✗ Content validation failed (${errors.length} issue(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const perDomain = domains
  .map(d => `${d.id}:${questions.filter(q => q.domain === d.id).length}`)
  .join("  ");
console.log(`✓ Content valid: ${certifications.length} certification(s), ${domains.length} domains, ${questions.length} questions, ${flashcards.length} flashcards, ${pbqs.length} PBQs`);
console.log(`  questions per domain -> ${perDomain}`);
