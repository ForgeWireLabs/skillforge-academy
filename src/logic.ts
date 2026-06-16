import type { AnsweredStat, Attempt, CardSchedule, CertId, CertProgress, Domain, ExamId, Flashcard, LearnerState, Pbq, Question, View } from "./types";

export const SCHEMA_VERSION = 3;
export const DEFAULT_CERT_ID = "a-plus";
export const DEFAULT_DAILY_GOAL = 25;

/** A fresh, empty progress bucket for a certification track. */
export function defaultProgress(): CertProgress {
  return { targetDate: "", dailyGoal: DEFAULT_DAILY_GOAL, streak: 0, lastStudyDate: "", dailyCounts: {} };
}

export const initialState: LearnerState = {
  schemaVersion: SCHEMA_VERSION,
  name: "Future Technician",
  activeCertId: DEFAULT_CERT_ID,
  progress: { [DEFAULT_CERT_ID]: defaultProgress() },
  answered: {},
  attempts: [],
  bookmarks: [],
  lessonsRead: [],
  notes: [],
  cardRatings: {},
  theme: "dark"
};

/** The progress bucket for the track currently in focus. */
export function activeProgress(state: LearnerState): CertProgress {
  return state.progress[state.activeCertId] ?? defaultProgress();
}

/** Returns new state with the active track's progress bucket patched. */
export function patchProgress(state: LearnerState, patch: Partial<CertProgress>): LearnerState {
  const next = { ...activeProgress(state), ...patch };
  return { ...state, progress: { ...state.progress, [state.activeCertId]: next } };
}

const DAY_MS = 86_400_000;

export function pct(n: number, d: number): number {
  return d ? Math.round((n / d) * 100) : 0;
}

export function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Local calendar day key, e.g. "2026-06-13". */
export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Questions answered on the given local day, within one track's progress. */
export function questionsToday(progress: CertProgress, today: string = dateKey()): number {
  return progress.dailyCounts[today] || 0;
}

/**
 * Records study activity for a day against one track's progress: advances the
 * streak (consecutive days), resets it after a gap, and increments the day's
 * question counter. Pure — returns only the fields that change.
 */
export function applyStudyActivity(
  progress: CertProgress,
  answeredCount: number,
  today: string = dateKey()
): Pick<CertProgress, "streak" | "lastStudyDate" | "dailyCounts"> {
  const yesterday = dateKey(new Date(new Date(`${today}T00:00:00`).getTime() - DAY_MS));
  let streak = progress.streak;
  if (progress.lastStudyDate === today) {
    // already studied today; streak unchanged
    streak = progress.streak || 1;
  } else if (progress.lastStudyDate === yesterday) {
    streak = progress.streak + 1;
  } else {
    streak = 1; // first study of a fresh run
  }
  return {
    streak,
    lastStudyDate: today,
    dailyCounts: { ...progress.dailyCounts, [today]: (progress.dailyCounts[today] || 0) + answeredCount }
  };
}

/** Folds one graded question into its cumulative answered stat. */
export function recordAnswer(prev: AnsweredStat | undefined, correct: boolean): AnsweredStat {
  return {
    correct: (prev?.correct || 0) + (correct ? 1 : 0),
    attempts: (prev?.attempts || 0) + 1,
    lastCorrect: correct
  };
}

/**
 * SM-2 style spaced-repetition scheduler. Ratings: 1 Again, 2 Hard, 3 Good,
 * 4 Easy. The ease factor actually drives the interval, and a lapse resets the
 * repetition count — unlike the previous fixed-multiplier version.
 */
export function scheduleCard(
  prev: CardSchedule | undefined,
  rating: 1 | 2 | 3 | 4,
  now: number = Date.now()
): CardSchedule {
  const quality = rating === 1 ? 2 : rating === 2 ? 3 : rating === 3 ? 4 : 5;
  let ease = prev?.ease ?? 2.5;
  let reps = prev?.reps ?? 0;
  let interval = prev?.interval ?? 0;
  let lapses = prev?.lapses ?? 0;

  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (quality < 3) {
    reps = 0;
    interval = 1;
    lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
    if (rating === 2) interval = Math.max(1, Math.round(interval * 0.8)); // Hard penalty
  }

  return { ease, interval, reps, lapses, due: new Date(now + interval * DAY_MS).toISOString() };
}

export function isCardDue(schedule: CardSchedule | undefined, now: Date = new Date()): boolean {
  return !schedule || schedule.due <= now.toISOString();
}

/**
 * Coverage-based, recency-weighted domain mastery: the share of a domain's
 * questions whose most recent attempt was correct. Unattempted or recently
 * missed questions count against mastery, so the number can't be inflated by
 * grinding one easy question.
 */
export function domainMastery(domainQuestions: Question[], answered: Record<string, AnsweredStat>): number {
  if (!domainQuestions.length) return 0;
  const mastered = domainQuestions.filter(q => answered[q.id]?.lastCorrect).length;
  return pct(mastered, domainQuestions.length);
}

/** Total distinct questions currently mastered (latest attempt correct). */
export function masteredCount(answered: Record<string, AnsweredStat>): number {
  return Object.values(answered).filter(a => a.lastCorrect).length;
}

export interface AppNotification {
  id: string;
  text: string;
  view: View;
}

/**
 * Derives actionable reminders for the header bell, scoped to the active track:
 * cards-due, daily-goal, and baseline all count only the focused certification.
 */
export function buildNotifications(state: LearnerState, content: { flashcards: Flashcard[] }, now: Date = new Date()): AppNotification[] {
  const out: AppNotification[] = [];
  const cert = state.activeCertId;
  const progress = activeProgress(state);

  const due = content.flashcards.filter(f => f.certId === cert && isCardDue(state.cardRatings[f.id], now)).length;
  if (due > 0) out.push({ id: "cards-due", text: `${due} flashcard${due > 1 ? "s" : ""} due for review`, view: "flashcards" });

  const remaining = progress.dailyGoal - questionsToday(progress, dateKey(now));
  if (remaining > 0) out.push({ id: "daily-goal", text: `${remaining} question${remaining > 1 ? "s" : ""} left in today's goal`, view: "practice" });

  if (progress.targetDate) {
    const days = Math.ceil((new Date(progress.targetDate).getTime() - now.getTime()) / DAY_MS);
    if (days >= 0) out.push({ id: "exam-countdown", text: days === 0 ? "Your exam is today — good luck!" : `${days} day${days > 1 ? "s" : ""} until your exam date`, view: "dashboard" });
  }

  if (state.attempts.filter(a => a.certId === cert).length === 0) out.push({ id: "baseline", text: "Take a baseline practice exam to start tracking readiness", view: "practice" });

  return out;
}

// ---------------------------------------------------------------------------
// Mock exams (full-length, timed, domain-weighted)
// ---------------------------------------------------------------------------

export const MOCK_PASS = 0.75;
export const MOCK_DEFAULT_QUESTIONS = 90;
export const MOCK_DEFAULT_MINUTES = 90;

export type MockItem = { type: "mcq"; question: Question } | { type: "pbq"; pbq: Pbq };

/**
 * Selects `count` questions for one exam core, distributed across its domains
 * in proportion to each domain's exam weight (so a 90-question mock mirrors the
 * real blueprint). Falls back to filling any rounding shortfall from the rest
 * of the pool, and never returns more than the pool holds.
 */
export function buildWeightedQuestionSet(questions: Question[], domains: Domain[], exam: ExamId, count: number): Question[] {
  const examDomains = domains.filter(d => d.exam === exam);
  const pool = questions.filter(q => q.exam === exam);
  const totalWeight = examDomains.reduce((s, d) => s + d.weight, 0) || 1;
  const picked: Question[] = [];
  const used = new Set<string>();
  for (const d of examDomains) {
    const target = Math.round((count * d.weight) / totalWeight);
    for (const q of shuffle(pool.filter(q => q.domain === d.id)).slice(0, target)) {
      picked.push(q);
      used.add(q.id);
    }
  }
  if (picked.length < count) {
    for (const q of shuffle(pool.filter(q => !used.has(q.id)))) {
      if (picked.length >= count) break;
      picked.push(q);
      used.add(q.id);
    }
  }
  return shuffle(picked).slice(0, count);
}

/** Builds a mock exam: a few PBQs up front (like the real exam), then weighted MCQs. */
export function buildMockExam(questions: Question[], pbqs: Pbq[], domains: Domain[], exam: ExamId, mcqCount: number, pbqCount: number): MockItem[] {
  const examPbqs = shuffle(pbqs.filter(p => p.exam === exam)).slice(0, pbqCount);
  const mcqs = buildWeightedQuestionSet(questions, domains, exam, mcqCount);
  return [
    ...examPbqs.map(pbq => ({ type: "pbq" as const, pbq })),
    ...mcqs.map(question => ({ type: "mcq" as const, question }))
  ];
}

/** Fractional score (0..1) for a PBQ response, supporting partial credit. */
export function gradePbq(pbq: Pbq, response: unknown): number {
  if (pbq.kind === "matching") {
    const r = (response && typeof response === "object" ? response : {}) as Record<string, string>;
    const total = pbq.items.length;
    if (!total) return 0;
    let correct = 0;
    for (const item of pbq.items) if (r[item.id] === pbq.answer[item.id]) correct++;
    return correct / total;
  }
  const r = Array.isArray(response) ? (response as string[]) : [];
  const total = pbq.steps.length;
  if (!total) return 0;
  let correct = 0;
  for (let i = 0; i < total; i++) if (r[i] === pbq.answer[i]) correct++;
  return correct / total;
}

export interface MockGrade {
  earned: number;
  total: number;
  pct: number;
  passed: boolean;
  domainScores: Record<string, { correct: number; total: number }>;
}

/** Grades a finished mock exam. MCQs score 1/0; PBQs award partial credit. */
export function scoreMock(
  items: MockItem[],
  mcqAnswers: Record<string, number>,
  pbqResponses: Record<string, unknown>,
  passThreshold = MOCK_PASS
): MockGrade {
  let earned = 0;
  const total = items.length;
  const domainScores: Record<string, { correct: number; total: number }> = {};
  for (const it of items) {
    const domain = it.type === "mcq" ? it.question.domain : it.pbq.domain;
    const frac = it.type === "mcq"
      ? (mcqAnswers[it.question.id] === it.question.answer ? 1 : 0)
      : gradePbq(it.pbq, pbqResponses[it.pbq.id]);
    earned += frac;
    domainScores[domain] ||= { correct: 0, total: 0 };
    domainScores[domain].total++;
    domainScores[domain].correct += frac;
  }
  const ratio = total ? earned / total : 0;
  return { earned, total, pct: Math.round(ratio * 100), passed: total > 0 && ratio >= passThreshold, domainScores };
}

export interface ObjectiveStat {
  objective: string;
  domain: string;
  mastered: number;
  total: number;
  mastery: number;
}

/**
 * Normalizes arbitrary persisted data into a valid LearnerState. Tolerates
 * older schemas and corrupt fields: anything missing or of the wrong type
 * falls back to a safe default, so a malformed save can never crash the app.
 */
export function migrateState(raw: unknown): LearnerState {
  const data = (raw && typeof raw === "object" ? raw : {}) as Partial<LearnerState> & Record<string, unknown>;
  const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
  const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
  const obj = <T>(v: unknown): Record<string, T> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, T>) : {});
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

  // v3 namespaced every bundled A+ content id under an "aplus-" prefix so ids stay
  // unique once other certifications ship. Saves from earlier schemas keyed progress
  // by the bare ids (e.g. "q01", "mobile"), so re-key those on upgrade — without it,
  // a returning learner would silently lose all answered/flashcard/bookmark history.
  const fromVersion = num((data as { schemaVersion?: unknown }).schemaVersion, 0);
  const certKey = (id: string): string => (fromVersion < 3 && !id.startsWith("aplus-") ? `aplus-${id}` : id);

  const answered: Record<string, AnsweredStat> = {};
  for (const [id, a] of Object.entries(obj<Partial<AnsweredStat>>(data.answered))) {
    if (!a || typeof a !== "object") continue;
    const correct = num(a.correct, 0);
    answered[certKey(id)] = {
      correct,
      attempts: num(a.attempts, 0),
      lastCorrect: typeof a.lastCorrect === "boolean" ? a.lastCorrect : correct > 0
    };
  }

  const cardRatings: Record<string, CardSchedule> = {};
  for (const [id, c] of Object.entries(obj<Partial<CardSchedule>>(data.cardRatings))) {
    if (!c || typeof c !== "object") continue;
    cardRatings[certKey(id)] = {
      ease: num(c.ease, 2.5),
      interval: num(c.interval, 0),
      due: str(c.due, ""),
      reps: num(c.reps, 0),
      lapses: num(c.lapses, 0)
    };
  }

  const dailyCounts: Record<string, number> = {};
  for (const [day, n] of Object.entries(obj<unknown>(data.dailyCounts))) {
    const v = num(n, NaN);
    if (Number.isFinite(v)) dailyCounts[day] = v;
  }

  // Attempt.domainScores is keyed by domain id (re-keyed on upgrade); every
  // attempt also belongs to a track — legacy attempts predate certId, so default
  // them to the A+ track they were necessarily recorded under.
  const attempts = arr<Attempt>(data.attempts).map(a => {
    if (!a || typeof a !== "object") return a;
    const scores = obj<{ correct: number; total: number }>(a.domainScores);
    const domainScores: Attempt["domainScores"] = {};
    for (const [d, v] of Object.entries(scores)) domainScores[certKey(d)] = v;
    const certId = typeof (a as { certId?: unknown }).certId === "string" ? (a as { certId: string }).certId : DEFAULT_CERT_ID;
    return { ...a, certId, domainScores };
  });

  // Per-cert progress. Carry forward any existing buckets; otherwise seed the
  // default track from the pre-Phase-1 top-level streak/goal/date fields so a
  // returning learner keeps their A+ cadence under the new umbrella.
  const progress: Record<CertId, CertProgress> = {};
  for (const [cid, pr] of Object.entries(obj<Partial<CertProgress>>(data.progress))) {
    if (!pr || typeof pr !== "object") continue;
    const counts: Record<string, number> = {};
    for (const [day, n] of Object.entries(obj<unknown>(pr.dailyCounts))) {
      const v = num(n, NaN);
      if (Number.isFinite(v)) counts[day] = v;
    }
    progress[cid] = {
      targetDate: str(pr.targetDate, ""),
      dailyGoal: num(pr.dailyGoal, DEFAULT_DAILY_GOAL),
      streak: num(pr.streak, 0),
      lastStudyDate: str(pr.lastStudyDate, ""),
      dailyCounts: counts
    };
  }
  if (!progress[DEFAULT_CERT_ID]) {
    progress[DEFAULT_CERT_ID] = {
      targetDate: str(data.targetDate, ""),
      dailyGoal: num(data.dailyGoal, DEFAULT_DAILY_GOAL),
      streak: num(data.streak, 0),
      lastStudyDate: str(data.lastStudyDate, ""),
      dailyCounts
    };
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    name: str(data.name, initialState.name),
    activeCertId: str(data.activeCertId, DEFAULT_CERT_ID),
    progress,
    answered,
    attempts,
    bookmarks: arr<string>(data.bookmarks).filter(b => typeof b === "string").map(certKey),
    lessonsRead: arr<string>(data.lessonsRead).filter(b => typeof b === "string").map(certKey),
    notes: arr(data.notes),
    cardRatings,
    theme: data.theme === "light" ? "light" : "dark"
  };
}

/** Per-objective mastery, weakest first, limited to attempted objectives. */
export function objectiveStats(
  questions: Question[],
  answered: Record<string, AnsweredStat>
): ObjectiveStat[] {
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    const list = groups.get(q.objective) || [];
    list.push(q);
    groups.set(q.objective, list);
  }
  const stats: ObjectiveStat[] = [];
  for (const [objective, qs] of groups) {
    const attempted = qs.some(q => answered[q.id]?.attempts);
    if (!attempted) continue;
    const mastered = qs.filter(q => answered[q.id]?.lastCorrect).length;
    stats.push({ objective, domain: qs[0].domain, mastered, total: qs.length, mastery: pct(mastered, qs.length) });
  }
  return stats.sort((a, b) => a.mastery - b.mastery);
}
