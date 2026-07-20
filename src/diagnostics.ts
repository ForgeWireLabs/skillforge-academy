import type { ContentBundle } from "./content/validate";
import { contentRevision } from "./content/revision";
import { SCHEMA_VERSION } from "./logic";
import type { LearnerState } from "./types";

/** Product version for diagnostic bundles; keep aligned with package.json / VERSION. */
export const APP_VERSION = "1.4.1-beta.1";

/** Source/build identity injected at build time (git short SHA or SKILLFORGE_BUILD). */
export const APP_BUILD = typeof __APP_BUILD__ !== "undefined" ? __APP_BUILD__ : "unknown";

export const DIAGNOSTIC_FORMAT = "skillforge-diagnostic" as const;
export const DIAGNOSTIC_VERSION = 1 as const;

export type DiagnosticError = {
  at: string;
  source: string;
  message: string;
};

export type DiagnosticOptions = {
  /** When true, include display name and note text. Off by default. */
  includeSensitive?: boolean;
  content?: ContentBundle;
  /** Override clock for tests. */
  now?: () => Date;
  /** Override platform probes for tests. */
  platform?: Partial<DiagnosticPlatform>;
};

export type DiagnosticPlatform = {
  userAgent: string;
  language: string;
  online: boolean;
  tauri: boolean;
  androidBridge: boolean;
  viewport: { width: number; height: number } | null;
};

export type DiagnosticBundle = {
  format: typeof DIAGNOSTIC_FORMAT;
  version: typeof DIAGNOSTIC_VERSION;
  generatedAt: string;
  stance: {
    telemetry: "none";
    crashReporting: "none";
    transport: "local-export-only";
  };
  app: {
    version: string;
    /** Short git SHA (or SKILLFORGE_BUILD) so bug reports pin an exact binary. */
    build: string;
    schemaVersion: number;
  };
  platform: DiagnosticPlatform;
  content: {
    /** Deterministic fingerprint of loaded bank payloads (not a marketing version). */
    revision: string;
    certifications: {
      id: string;
      status: string;
      domains: number;
      questions: number;
      flashcards: number;
      pbqs: number;
      lessons: number;
      objectives: number;
    }[];
    totals: {
      domains: number;
      questions: number;
      flashcards: number;
      pbqs: number;
      lessons: number;
      objectives: number;
    };
  };
  state: {
    schemaVersion: number;
    activeCertId: string;
    theme: string;
    progress: Record<string, { dailyGoal: number; streak: number; hasTargetDate: boolean; studyDays: number }>;
    counts: {
      answered: number;
      attempts: number;
      bookmarks: number;
      lessonsRead: number;
      notes: number;
      cardRatings: number;
    };
    attemptsSummary: {
      id: string;
      certId: string;
      date: string;
      exam: string;
      score: number;
      total: number;
      kind: string;
      passed: boolean | null;
    }[];
    /** Present only when includeSensitive is true. */
    name?: string;
    notes?: { id: string; title: string; body: string; updatedAt: string }[];
  };
  recentErrors: DiagnosticError[];
  redaction: {
    includeSensitive: boolean;
    excludedByDefault: string[];
  };
};

const MAX_ERRORS = 50;
let recentErrors: DiagnosticError[] = [];

export function clearDiagnosticErrors(): void {
  recentErrors = [];
}

export function getRecentDiagnosticErrors(): readonly DiagnosticError[] {
  return recentErrors;
}

/** Record a support-relevant failure in the in-memory ring (never auto-uploaded). */
export function recordDiagnosticError(source: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const entry: DiagnosticError = {
    at: new Date().toISOString(),
    source,
    message: message.slice(0, 500)
  };
  recentErrors = [...recentErrors.slice(-(MAX_ERRORS - 1)), entry];
}

function detectPlatform(over: Partial<DiagnosticPlatform> = {}): DiagnosticPlatform {
  const hasWindow = typeof window !== "undefined";
  const ua = hasWindow && typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
  return {
    userAgent: over.userAgent ?? ua,
    language: over.language ?? (hasWindow && typeof navigator !== "undefined" ? navigator.language : "unknown"),
    online: over.online ?? (hasWindow && typeof navigator !== "undefined" ? navigator.onLine : false),
    tauri: over.tauri ?? (hasWindow && "__TAURI_INTERNALS__" in window),
    androidBridge: over.androidBridge ?? (hasWindow && Boolean((window as Window & { SkillForgeAndroid?: unknown }).SkillForgeAndroid)),
    viewport: over.viewport ?? (hasWindow ? { width: window.innerWidth, height: window.innerHeight } : null)
  };
}

function contentInventory(content?: ContentBundle): DiagnosticBundle["content"] {
  const certifications = (content?.certifications ?? []).map(cert => {
    const id = cert.id;
    return {
      id,
      status: cert.status ?? "available",
      domains: (content?.domains ?? []).filter(d => d.certId === id).length,
      questions: (content?.questions ?? []).filter(q => q.certId === id).length,
      flashcards: (content?.flashcards ?? []).filter(f => f.certId === id).length,
      pbqs: (content?.pbqs ?? []).filter(p => p.certId === id).length,
      lessons: (content?.lessons ?? []).filter(l => l.certId === id).length,
      objectives: (content?.objectives ?? []).filter(o => o.certId === id).length
    };
  });
  const totals = certifications.reduce(
    (acc, c) => ({
      domains: acc.domains + c.domains,
      questions: acc.questions + c.questions,
      flashcards: acc.flashcards + c.flashcards,
      pbqs: acc.pbqs + c.pbqs,
      lessons: acc.lessons + c.lessons,
      objectives: acc.objectives + c.objectives
    }),
    { domains: 0, questions: 0, flashcards: 0, pbqs: 0, lessons: 0, objectives: 0 }
  );
  const empty: ContentBundle = {
    certifications: [],
    domains: [],
    questions: [],
    flashcards: [],
    pbqs: [],
    lessons: [],
    objectives: []
  };
  return {
    revision: contentRevision(content ?? empty),
    certifications,
    totals
  };
}

/**
 * Build a local diagnostic bundle for support. Never transmits data.
 * Sensitive learner content (display name, note text) is omitted unless
 * `includeSensitive` is explicitly true.
 */
export function buildDiagnosticBundle(state: LearnerState, options: DiagnosticOptions = {}): DiagnosticBundle {
  const includeSensitive = Boolean(options.includeSensitive);
  const now = options.now?.() ?? new Date();
  const progress: DiagnosticBundle["state"]["progress"] = {};
  for (const [certId, p] of Object.entries(state.progress ?? {})) {
    if (!p || typeof p !== "object") continue;
    progress[certId] = {
      dailyGoal: typeof p.dailyGoal === "number" ? p.dailyGoal : 0,
      streak: typeof p.streak === "number" ? p.streak : 0,
      hasTargetDate: Boolean(p.targetDate),
      studyDays: Object.keys(p.dailyCounts ?? {}).length
    };
  }

  const stateSlice: DiagnosticBundle["state"] = {
    schemaVersion: state.schemaVersion ?? SCHEMA_VERSION,
    activeCertId: state.activeCertId,
    theme: state.theme,
    progress,
    counts: {
      answered: Object.keys(state.answered ?? {}).length,
      attempts: (state.attempts ?? []).length,
      bookmarks: (state.bookmarks ?? []).length,
      lessonsRead: (state.lessonsRead ?? []).length,
      notes: (state.notes ?? []).length,
      cardRatings: Object.keys(state.cardRatings ?? {}).length
    },
    attemptsSummary: (state.attempts ?? []).slice(-20).map(a => ({
      id: a.id,
      certId: a.certId,
      date: a.date,
      exam: String(a.exam),
      score: a.score,
      total: a.total,
      kind: a.kind ?? "practice",
      passed: typeof a.passed === "boolean" ? a.passed : null
    }))
  };

  if (includeSensitive) {
    stateSlice.name = state.name;
    stateSlice.notes = (state.notes ?? []).map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      updatedAt: n.updatedAt
    }));
  }

  return {
    format: DIAGNOSTIC_FORMAT,
    version: DIAGNOSTIC_VERSION,
    generatedAt: now.toISOString(),
    stance: {
      telemetry: "none",
      crashReporting: "none",
      transport: "local-export-only"
    },
    app: {
      version: APP_VERSION,
      build: APP_BUILD,
      schemaVersion: SCHEMA_VERSION
    },
    platform: detectPlatform(options.platform),
    content: contentInventory(options.content),
    state: stateSlice,
    recentErrors: [...recentErrors],
    redaction: {
      includeSensitive,
      excludedByDefault: ["displayName", "noteTitles", "noteBodies"]
    }
  };
}

export function serializeDiagnosticBundle(bundle: DiagnosticBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

/** Download a diagnostic JSON file in the browser (and desktop WebView). */
export function downloadDiagnosticBundle(bundle: DiagnosticBundle, filename?: string): string {
  const name = filename ?? `skillforge-diagnostic-${bundle.generatedAt.slice(0, 10)}.json`;
  const blob = new Blob([serializeDiagnosticBundle(bundle)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return name;
}
