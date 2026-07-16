import { invoke } from "@tauri-apps/api/core";
import type { Certification, Domain, Flashcard, Lesson, Objective, Pbq, Question } from "../types";
import { isCertAvailable, sortCertifications } from "../logic";
import { validateContent, type ContentBundle } from "./validate";
import certificationsJson from "./certifications.json";

export type { ContentBundle } from "./validate";

type JsonModule<T> = { default: T };
type BankName = "domains" | "questions" | "flashcards" | "pbqs" | "lessons" | "objectives";

const REQUIRED_BANKS = ["domains", "questions", "flashcards"] as const satisfies readonly BankName[];

const bankModules = {
  domains: import.meta.glob<JsonModule<Domain[]>>("./*/domains.json", { eager: true }),
  questions: import.meta.glob<JsonModule<Question[]>>("./*/questions.json", { eager: true }),
  flashcards: import.meta.glob<JsonModule<Flashcard[]>>("./*/flashcards.json", { eager: true }),
  pbqs: import.meta.glob<JsonModule<Pbq[]>>("./*/pbqs.json", { eager: true }),
  lessons: import.meta.glob<JsonModule<Lesson[]>>("./*/lessons.json", { eager: true }),
  objectives: import.meta.glob<JsonModule<Objective[]>>("./*/objectives.json", { eager: true })
};

function bankPath(certId: string, bank: BankName): string {
  return `./${certId}/${bank}.json`;
}

function readBank<T>(cert: Certification, bank: BankName, required: boolean): T[] {
  const mod = bankModules[bank][bankPath(cert.id, bank)] as JsonModule<T[]> | undefined;
  if (!mod) {
    // Coming-soon tracks are advertised before their banks exist, so a missing
    // bank is only worth warning about for an available track.
    if (required && isCertAvailable(cert)) console.warn(`Missing bundled content bank: ${cert.id}/${bank}.json`);
    return [];
  }
  return mod.default;
}

function buildBundledContent(certifications: Certification[]): ContentBundle {
  const ordered = sortCertifications(certifications);
  return {
    certifications: ordered,
    domains: ordered.flatMap(cert => readBank<Domain>(cert, "domains", REQUIRED_BANKS.includes("domains"))),
    questions: ordered.flatMap(cert => readBank<Question>(cert, "questions", REQUIRED_BANKS.includes("questions"))),
    flashcards: ordered.flatMap(cert => readBank<Flashcard>(cert, "flashcards", REQUIRED_BANKS.includes("flashcards"))),
    pbqs: ordered.flatMap(cert => readBank<Pbq>(cert, "pbqs", false)),
    lessons: ordered.flatMap(cert => readBank<Lesson>(cert, "lessons", false)),
    objectives: ordered.flatMap(cert => readBank<Objective>(cert, "objectives", false))
  };
}

/**
 * Bundled content shipped with the app. Acts as the offline fallback and as the
 * source consumed by tests and validation. Each certification's banks live under
 * `src/content/<cert-id>/`; add a track by adding its manifest entry and bank
 * files, not by editing this registry.
 */
export const bundledContent: ContentBundle = buildBundledContent(certificationsJson as Certification[]);

function isTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise.then(
      value => {
        window.clearTimeout(timer);
        resolve(value);
      },
      error => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Loads the active content bundle. On the desktop build it prefers content read
 * by the Rust backend from bundled resource files. Any failure or malformed
 * payload falls back to the bundled content so the app always starts with a
 * valid bank.
 */
export async function loadContent(): Promise<ContentBundle> {
  if (!isTauri()) return bundledContent;
  try {
    const remote = await withTimeout(invoke<Partial<ContentBundle>>("load_content"), 5000, "load_content");
    const errors = validateContent(remote);
    if (errors.length) {
      console.warn("Backend content failed validation; using bundled content.", errors);
      return bundledContent;
    }
    const bundle = remote as ContentBundle;
    return { ...bundle, certifications: sortCertifications(bundle.certifications) };
  } catch (err) {
    console.warn("Could not load backend content; using bundled content.", err);
    return bundledContent;
  }
}
