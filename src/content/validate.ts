import type { Certification, Domain, Flashcard, Lesson, Objective, Pbq, Question } from "../types";

export interface ContentBundle {
  certifications: Certification[];
  domains: Domain[];
  questions: Question[];
  flashcards: Flashcard[];
  pbqs: Pbq[];
  lessons: Lesson[];
  /** Published exam objectives per track (required array; may be empty). */
  objectives: Objective[];
}

const DIFFICULTIES = ["Foundation", "Intermediate", "Advanced"];

/**
 * Validates an MCQ `answer`, which is a single option index or — for a
 * multi-select ("choose TWO/THREE") question — an array of distinct indices.
 * A multi-select must name at least two options and leave at least one wrong,
 * so the set is meaningfully gradable. Returns any error strings found.
 */
function validateMcqAnswer(id: string, answer: unknown, optionCount: number): string[] {
  const inRange = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0 && (n as number) < optionCount;
  if (Array.isArray(answer)) {
    if (answer.length < 2) return [`Question ${id}: multi-select answer needs at least 2 indices`];
    if (answer.length >= optionCount) return [`Question ${id}: multi-select answer cannot include every option`];
    if (new Set(answer).size !== answer.length) return [`Question ${id}: multi-select answer has duplicate indices`];
    const bad = answer.find(n => !inRange(n));
    if (bad !== undefined) return [`Question ${id}: answer index ${bad} is out of range`];
    return [];
  }
  if (!inRange(answer)) return [`Question ${id}: answer index ${answer} is out of range`];
  return [];
}

/**
 * Validates a content bundle and returns a list of human-readable errors.
 * An empty array means the content is structurally sound. Shared by the
 * runtime loader (to reject malformed backend content) and the
 * `validate:content` authoring script.
 *
 * The certification manifest is the source of truth: every domain/question/PBQ
 * must reference a known cert and one of that cert's exams, and every content id
 * must carry its cert's id prefix so ids stay globally unique across tracks.
 */
export function validateContent(content: Partial<ContentBundle> | null | undefined): string[] {
  const errors: string[] = [];
  if (!content || typeof content !== "object") return ["Content is not an object"];

  const { certifications, domains, questions, flashcards, pbqs, lessons, objectives } = content;
  if (!Array.isArray(certifications) || certifications.length === 0) errors.push("certifications must be a non-empty array");
  if (!Array.isArray(domains) || domains.length === 0) errors.push("domains must be a non-empty array");
  if (!Array.isArray(questions) || questions.length === 0) errors.push("questions must be a non-empty array");
  if (!Array.isArray(flashcards) || flashcards.length === 0) errors.push("flashcards must be a non-empty array");
  if (pbqs !== undefined && !Array.isArray(pbqs)) errors.push("pbqs must be an array when present");
  if (lessons !== undefined && !Array.isArray(lessons)) errors.push("lessons must be an array when present");
  // Objectives are required so Learning Paths can call `.filter` safely on the
  // Tauri resource-loading path (missing key previously passed validation).
  if (!Array.isArray(objectives)) errors.push("objectives must be an array");
  if (errors.length) return errors;

  // ---- Certification manifest ------------------------------------------------
  const certIds = new Set<string>();
  const prefixByCert = new Map<string, string>();
  const certByPrefix = new Map<string, string>(); // idPrefix -> certId (must be 1:1)
  const examToCert = new Map<string, string>(); // examId -> certId
  for (const c of certifications as Certification[]) {
    if (certIds.has(c.id)) errors.push(`Duplicate certification id: ${c.id}`);
    certIds.add(c.id);
    if (!c.idPrefix?.trim()) errors.push(`Certification ${c.id}: empty idPrefix`);
    else {
      // Prefixes must be unique across tracks, or content ids from different
      // tracks could collide (every content id is namespaced by its prefix).
      const owner = certByPrefix.get(c.idPrefix);
      if (owner) errors.push(`Certification ${c.id}: idPrefix "${c.idPrefix}" already used by "${owner}"`);
      else certByPrefix.set(c.idPrefix, c.id);
      prefixByCert.set(c.id, c.idPrefix);
    }
    for (const field of ["name", "shortName", "vendor"] as const)
      if (!c[field]?.trim()) errors.push(`Certification ${c.id}: empty ${field}`);
    if (typeof c.passThreshold !== "number" || c.passThreshold <= 0 || c.passThreshold > 1)
      errors.push(`Certification ${c.id}: passThreshold must be between 0 and 1`);
    if (c.status !== undefined && c.status !== "available" && c.status !== "coming-soon")
      errors.push(`Certification ${c.id}: status must be "available" or "coming-soon"`);
    if (c.order !== undefined && !Number.isFinite(c.order))
      errors.push(`Certification ${c.id}: order must be a number when present`);
    if (!Array.isArray(c.exams) || c.exams.length === 0) errors.push(`Certification ${c.id}: needs at least one exam`);
    for (const e of c.exams ?? []) {
      if (examToCert.has(e.id)) errors.push(`Duplicate exam id: ${e.id}`);
      examToCert.set(e.id, c.id);
      if (e.certId !== c.id) errors.push(`Exam ${e.id}: certId "${e.certId}" does not match certification "${c.id}"`);
      if (!Number.isFinite(e.defaultQuestions) || e.defaultQuestions <= 0) errors.push(`Exam ${e.id}: invalid defaultQuestions`);
      if (!Number.isFinite(e.defaultMinutes) || e.defaultMinutes <= 0) errors.push(`Exam ${e.id}: invalid defaultMinutes`);
    }
  }

  /** Shared cert/exam/prefix checks for any content item that carries them. */
  const checkCertRefs = (label: string, certId: string, id: string, exam?: string) => {
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

  const certList = certifications as Certification[];
  const domainList = domains as Domain[];
  const questionList = questions as Question[];
  const flashcardList = flashcards as Flashcard[];
  const pbqList = (pbqs ?? []) as Pbq[];
  const lessonList = (lessons ?? []) as Lesson[];
  const objectiveList = (objectives ?? []) as Objective[];

  for (const c of certList) {
    // Coming-soon tracks are advertised before any banks are authored, so the
    // required-bank check only applies to available tracks.
    if (c.status === "coming-soon") continue;
    const counts = {
      domains: domainList.filter(d => d.certId === c.id).length,
      questions: questionList.filter(q => q.certId === c.id).length,
      flashcards: flashcardList.filter(f => f.certId === c.id).length
    };
    for (const [bank, count] of Object.entries(counts)) {
      if (count === 0) errors.push(`Certification ${c.id}: missing required ${bank} bank content`);
    }
  }

  // ---- Domains ---------------------------------------------------------------
  const domainIds = new Set(domainList.map(d => d.id));
  const domainToCert = new Map(domainList.map(d => [d.id, d.certId]));
  const seenDomain = new Set<string>();
  for (const d of domainList) {
    if (seenDomain.has(d.id)) errors.push(`Duplicate domain id: ${d.id}`);
    seenDomain.add(d.id);
    checkCertRefs(`Domain ${d.id}`, d.certId, d.id, d.exam);
  }

  // ---- Questions -------------------------------------------------------------
  const seenQ = new Set<string>();
  for (const q of questionList) {
    if (seenQ.has(q.id)) errors.push(`Duplicate question id: ${q.id}`);
    seenQ.add(q.id);
    checkCertRefs(`Question ${q.id}`, q.certId, q.id, q.exam);
    if (!domainIds.has(q.domain)) errors.push(`Question ${q.id}: unknown domain "${q.domain}"`);
    else if (domainToCert.get(q.domain) !== q.certId) errors.push(`Question ${q.id}: domain "${q.domain}" does not belong to cert "${q.certId}"`);
    if (!DIFFICULTIES.includes(q.difficulty)) errors.push(`Question ${q.id}: invalid difficulty "${q.difficulty}"`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`Question ${q.id}: needs at least 2 options`);
    else errors.push(...validateMcqAnswer(q.id, q.answer, q.options.length));
    if (!q.prompt?.trim()) errors.push(`Question ${q.id}: empty prompt`);
    if (!q.explanation?.trim()) errors.push(`Question ${q.id}: empty explanation`);
    if (!q.objective?.trim()) errors.push(`Question ${q.id}: empty objective`);
  }

  // ---- Flashcards ------------------------------------------------------------
  const seenF = new Set<string>();
  for (const f of flashcardList) {
    if (seenF.has(f.id)) errors.push(`Duplicate flashcard id: ${f.id}`);
    seenF.add(f.id);
    checkCertRefs(`Flashcard ${f.id}`, f.certId, f.id);
    if (!domainIds.has(f.domain)) errors.push(`Flashcard ${f.id}: unknown domain "${f.domain}"`);
    else if (domainToCert.get(f.domain) !== f.certId) errors.push(`Flashcard ${f.id}: domain "${f.domain}" does not belong to cert "${f.certId}"`);
    if (!f.front?.trim()) errors.push(`Flashcard ${f.id}: empty front`);
    if (!f.back?.trim()) errors.push(`Flashcard ${f.id}: empty back`);
  }

  // ---- PBQs ------------------------------------------------------------------
  const seenP = new Set<string>();
  for (const p of pbqList) {
    if (seenP.has(p.id)) errors.push(`Duplicate PBQ id: ${p.id}`);
    seenP.add(p.id);
    checkCertRefs(`PBQ ${p.id}`, p.certId, p.id, p.exam);
    if (!domainIds.has(p.domain)) errors.push(`PBQ ${p.id}: unknown domain "${p.domain}"`);
    else if (domainToCert.get(p.domain) !== p.certId) errors.push(`PBQ ${p.id}: domain "${p.domain}" does not belong to cert "${p.certId}"`);
    if (!p.prompt?.trim()) errors.push(`PBQ ${p.id}: empty prompt`);
    if (!p.explanation?.trim()) errors.push(`PBQ ${p.id}: empty explanation`);
    if (p.kind === "matching") {
      const itemIds = new Set(p.items?.map(i => i.id));
      const targetIds = new Set(p.targets?.map(t => t.id));
      if (!p.items?.length || !p.targets?.length) errors.push(`PBQ ${p.id}: matching needs items and targets`);
      for (const id of itemIds) if (!(id in (p.answer || {}))) errors.push(`PBQ ${p.id}: item "${id}" has no answer`);
      for (const [item, target] of Object.entries(p.answer || {})) {
        if (!itemIds.has(item)) errors.push(`PBQ ${p.id}: answer references unknown item "${item}"`);
        if (!targetIds.has(target)) errors.push(`PBQ ${p.id}: answer references unknown target "${target}"`);
      }
    } else if (p.kind === "categorization") {
      const itemIds = new Set(p.items?.map(i => i.id));
      const categoryIds = new Set(p.categories?.map(c => c.id));
      if (!p.items?.length || !p.categories?.length) errors.push(`PBQ ${p.id}: categorization needs items and categories`);
      for (const c of p.categories || []) {
        if (!c.id?.trim() || !c.label?.trim()) errors.push(`PBQ ${p.id}: categories need id and label`);
      }
      for (const item of p.items || []) {
        if (!item.id?.trim() || !item.text?.trim()) errors.push(`PBQ ${p.id}: categorization items need id and text`);
        if (!(item.id in (p.answer || {}))) errors.push(`PBQ ${p.id}: item "${item.id}" has no answer`);
      }
      for (const [item, category] of Object.entries(p.answer || {})) {
        if (!itemIds.has(item)) errors.push(`PBQ ${p.id}: answer references unknown item "${item}"`);
        if (!categoryIds.has(category)) errors.push(`PBQ ${p.id}: answer references unknown category "${category}"`);
      }
    } else if (p.kind === "ordering") {
      const stepIds = new Set(p.steps?.map(s => s.id));
      if (!p.steps?.length) errors.push(`PBQ ${p.id}: ordering needs steps`);
      if (p.answer?.length !== p.steps?.length) errors.push(`PBQ ${p.id}: answer length must match steps`);
      for (const id of p.answer || []) if (!stepIds.has(id)) errors.push(`PBQ ${p.id}: answer references unknown step "${id}"`);
    } else if (p.kind === "fillin") {
      if (!p.blanks?.length) errors.push(`PBQ ${p.id}: fillin needs blanks`);
      const blankIds = new Set<string>();
      for (const b of p.blanks || []) {
        if (!b.id || blankIds.has(b.id)) errors.push(`PBQ ${p.id}: blank ids must be present and unique`);
        blankIds.add(b.id);
        if (!b.label?.trim()) errors.push(`PBQ ${p.id}: blank "${b.id}" needs a label`);
        if (!b.accept?.length || b.accept.some(a => !a?.trim())) errors.push(`PBQ ${p.id}: blank "${b.id}" needs non-empty accepted answers`);
      }
    } else {
      const bad = p as { id: string; kind?: string };
      errors.push(`PBQ ${bad.id}: unknown kind "${bad.kind}"`);
    }
  }

  // ---- Lessons (optional) ----------------------------------------------------
  const seenL = new Set<string>();
  for (const l of lessonList) {
    if (seenL.has(l.id)) errors.push(`Duplicate lesson id: ${l.id}`);
    seenL.add(l.id);
    checkCertRefs(`Lesson ${l.id}`, l.certId, l.id, l.exam);
    if (!domainIds.has(l.domain)) errors.push(`Lesson ${l.id}: unknown domain "${l.domain}"`);
    else if (domainToCert.get(l.domain) !== l.certId) errors.push(`Lesson ${l.id}: domain "${l.domain}" does not belong to cert "${l.certId}"`);
    if (!l.title?.trim()) errors.push(`Lesson ${l.id}: empty title`);
    if (typeof l.order !== "number") errors.push(`Lesson ${l.id}: order must be a number`);
    if (!Array.isArray(l.sections) || l.sections.length === 0) errors.push(`Lesson ${l.id}: needs at least one section`);
    else l.sections.forEach((s, i) => {
      if (!s || typeof s !== "object") errors.push(`Lesson ${l.id}: section ${i} is not an object`);
      else {
        if (!s.body?.trim()) errors.push(`Lesson ${l.id}: section ${i} has empty body`);
        if (s.image) {
          if (!s.image.src?.trim()) errors.push(`Lesson ${l.id}: section ${i} image has empty src`);
          if (!s.image.alt?.trim()) errors.push(`Lesson ${l.id}: section ${i} image needs alt text`);
        }
      }
    });
  }

  // ---- Objectives (optional registry) ---------------------------------------
  const objectiveIds = new Set<string>();
  const objectiveToCert = new Map<string, string>();
  const objectiveToDomain = new Map<string, string>();
  const seenObj = new Set<string>();
  for (const o of objectiveList) {
    if (seenObj.has(o.id)) errors.push(`Duplicate objective id: ${o.id}`);
    seenObj.add(o.id);
    checkCertRefs(`Objective ${o.id}`, o.certId, o.id, o.exam);
    if (!domainIds.has(o.domain)) errors.push(`Objective ${o.id}: unknown domain "${o.domain}"`);
    else if (domainToCert.get(o.domain) !== o.certId) errors.push(`Objective ${o.id}: domain "${o.domain}" does not belong to cert "${o.certId}"`);
    if (!o.code?.trim()) errors.push(`Objective ${o.id}: empty code`);
    if (!o.title?.trim()) errors.push(`Objective ${o.id}: empty title`);
    objectiveIds.add(o.id);
    objectiveToCert.set(o.id, o.certId);
    objectiveToDomain.set(o.id, o.domain);
  }

  // Any content item that references an objective must point at an existing one
  // in the same certification, and its own domain must match the objective's
  // domain (content is filed under the same domain the objective lives in).
  const checkObjectiveRef = (label: string, certId: string, domain: string, objectiveId?: string) => {
    if (objectiveId === undefined) return;
    if (!objectiveIds.has(objectiveId)) { errors.push(`${label}: unknown objectiveId "${objectiveId}"`); return; }
    if (objectiveToCert.get(objectiveId) !== certId) errors.push(`${label}: objectiveId "${objectiveId}" does not belong to cert "${certId}"`);
    if (objectiveToDomain.get(objectiveId) !== domain) errors.push(`${label}: domain "${domain}" does not match objective "${objectiveId}" domain "${objectiveToDomain.get(objectiveId)}"`);
  };
  for (const q of questionList) checkObjectiveRef(`Question ${q.id}`, q.certId, q.domain, q.objectiveId);
  for (const f of flashcardList) checkObjectiveRef(`Flashcard ${f.id}`, f.certId, f.domain, f.objectiveId);
  for (const p of pbqList) checkObjectiveRef(`PBQ ${p.id}`, p.certId, p.domain, p.objectiveId);
  for (const l of lessonList) checkObjectiveRef(`Lesson ${l.id}`, l.certId, l.domain, l.objectiveId);

  return errors;
}
