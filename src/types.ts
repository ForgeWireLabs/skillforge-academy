export type ExamCode = "220-1201" | "220-1202";
/** A certification track id, e.g. "a-plus", "network-plus". */
export type CertId = string;
/** A specific exam within a certification, e.g. "220-1201", "n10-009". */
export type ExamId = string;
export type View = "dashboard" | "learn" | "practice" | "pbq" | "mock" | "flashcards" | "analytics" | "notes" | "settings";
export type Difficulty = "Foundation" | "Intermediate" | "Advanced";

/** One exam (paper) belonging to a certification. A+ has two cores; most certs have one. */
export interface ExamMeta {
  id: ExamId;
  certId: CertId;
  /** Display label, e.g. "Core 1" — empty for single-exam certifications. */
  name: string;
  /** Default question count for a full-length mock of this exam. */
  defaultQuestions: number;
  /** Default time limit (minutes) for a full-length mock of this exam. */
  defaultMinutes: number;
}

/** A certification track. The manifest of these is the umbrella over all content. */
export interface Certification {
  id: CertId;
  name: string;        // "CompTIA A+"
  shortName: string;   // "A+"
  vendor: string;      // "CompTIA"
  /** Slug every content id in this track must be prefixed with, e.g. "aplus". */
  idPrefix: string;
  description: string;
  /** Mock-exam pass line as a fraction (0..1). */
  passThreshold: number;
  exams: ExamMeta[];
}

export interface Domain {
  id: string;
  certId: CertId;
  exam: ExamCode;
  name: string;
  weight: number;
  color: string;
  description: string;
  topics: string[];
}

export interface Question {
  id: string;
  certId: CertId;
  exam: ExamCode;
  domain: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  objective: string;
}

interface PbqBase {
  id: string;
  certId: CertId;
  exam: ExamCode;
  domain: string;
  difficulty: Difficulty;
  prompt: string;
  objective: string;
  explanation: string;
}

/** Assign each item to the correct category/target (e.g. port -> protocol). */
export interface MatchingPbq extends PbqBase {
  kind: "matching";
  items: { id: string; text: string }[];
  targets: { id: string; label: string }[];
  /** itemId -> correct targetId */
  answer: Record<string, string>;
}

/** Put the steps in the correct order (e.g. troubleshooting sequence). */
export interface OrderingPbq extends PbqBase {
  kind: "ordering";
  steps: { id: string; text: string }[];
  /** step ids in their correct order */
  answer: string[];
}

export type Pbq = MatchingPbq | OrderingPbq;

export interface Flashcard {
  id: string;
  certId: CertId;
  domain: string;
  front: string;
  back: string;
}

export interface Attempt {
  id: string;
  date: string;
  exam: ExamCode | "Mixed";
  score: number;
  total: number;
  durationSec: number;
  domainScores: Record<string, { correct: number; total: number }>;
  /** "practice" (default) or "mock" for full-length timed exams. */
  kind?: "practice" | "mock";
  /** Whether a mock exam met the pass threshold. */
  passed?: boolean;
}

export interface AnsweredStat {
  correct: number;
  attempts: number;
  /** Whether the most recent attempt at this question was correct. */
  lastCorrect: boolean;
}

export interface CardSchedule {
  ease: number;
  interval: number;
  due: string;
  /** Successful repetitions in a row (SM-2). Reset to 0 on a lapse. */
  reps: number;
  /** Number of times the card has been failed ("Again"). */
  lapses: number;
}

export interface LearnerState {
  /** Bumped when the persisted shape changes; drives migrate-on-load. */
  schemaVersion: number;
  name: string;
  targetDate: string;
  dailyGoal: number;
  streak: number;
  lastStudyDate: string;
  /** Questions answered per local day, keyed YYYY-MM-DD. */
  dailyCounts: Record<string, number>;
  answered: Record<string, AnsweredStat>;
  attempts: Attempt[];
  bookmarks: string[];
  notes: { id: string; title: string; body: string; updatedAt: string }[];
  cardRatings: Record<string, CardSchedule>;
  theme: "dark" | "light";
}
