export type ExamCode = "220-1201" | "220-1202";
export type View = "dashboard" | "learn" | "practice" | "flashcards" | "analytics" | "notes" | "settings";

export interface Domain {
  id: string;
  exam: ExamCode;
  name: string;
  weight: number;
  color: string;
  description: string;
  topics: string[];
}

export interface Question {
  id: string;
  exam: ExamCode;
  domain: string;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  objective: string;
}

export interface Flashcard {
  id: string;
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
