import type { Certification, Domain, Flashcard, Lesson, Pbq, Question } from "../types";

export interface ContentBundle {
  certifications: Certification[];
  domains: Domain[];
  questions: Question[];
  flashcards: Flashcard[];
  pbqs: Pbq[];
  lessons: Lesson[];
}

const DIFFICULTIES = ["Foundation", "Intermediate", "Advanced"];

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

  const { certifications, domains, questions, flashcards, pbqs, lessons } = content;
  if (!Array.isArray(certifications) || certifications.length === 0) errors.push("certifications must be a non-empty array");
  if (!Array.isArray(domains) || domains.length === 0) errors.push("domains must be a non-empty array");
  if (!Array.isArray(questions) || questions.length === 0) errors.push("questions must be a non-empty array");
  if (!Array.isArray(flashcards) || flashcards.length === 0) errors.push("flashcards must be a non-empty array");
  if (pbqs !== undefined && !Array.isArray(pbqs)) errors.push("pbqs must be an array when present");
  if (lessons !== undefined && !Array.isArray(lessons)) errors.push("lessons must be an array when present");
  if (errors.length) return errors;

  // ---- Certification manifest ------------------------------------------------
  const certIds = new Set<string>();
  const prefixByCert = new Map<string, string>();
  const examToCert = new Map<string, string>(); // examId -> certId
  for (const c of certifications as Certification[]) {
    if (certIds.has(c.id)) errors.push(`Duplicate certification id: ${c.id}`);
    certIds.add(c.id);
    if (!c.idPrefix?.trim()) errors.push(`Certification ${c.id}: empty idPrefix`);
    else prefixByCert.set(c.id, c.idPrefix);
    for (const field of ["name", "shortName", "vendor"] as const)
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

  for (const c of certList) {
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
    else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      errors.push(`Question ${q.id}: answer index ${q.answer} is out of range`);
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
    } else if (p.kind === "ordering") {
      const stepIds = new Set(p.steps?.map(s => s.id));
      if (!p.steps?.length) errors.push(`PBQ ${p.id}: ordering needs steps`);
      if (p.answer?.length !== p.steps?.length) errors.push(`PBQ ${p.id}: answer length must match steps`);
      for (const id of p.answer || []) if (!stepIds.has(id)) errors.push(`PBQ ${p.id}: answer references unknown step "${id}"`);
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

  return errors;
}
