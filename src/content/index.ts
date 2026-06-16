import { invoke } from "@tauri-apps/api/core";
import type { Certification, Domain, Flashcard, Lesson, Pbq, Question } from "../types";
import { validateContent, type ContentBundle } from "./validate";
import certificationsJson from "./certifications.json";

export type { ContentBundle } from "./validate";

type JsonModule<T> = { default: T };
type BankName = "domains" | "questions" | "flashcards" | "pbqs" | "lessons";

const REQUIRED_BANKS = ["domains", "questions", "flashcards"] as const satisfies readonly BankName[];

const bankModules = {
  domains: import.meta.glob<JsonModule<Domain[]>>("./*/domains.json", { eager: true }),
  questions: import.meta.glob<JsonModule<Question[]>>("./*/questions.json", { eager: true }),
  flashcards: import.meta.glob<JsonModule<Flashcard[]>>("./*/flashcards.json", { eager: true }),
  pbqs: import.meta.glob<JsonModule<Pbq[]>>("./*/pbqs.json", { eager: true }),
  lessons: import.meta.glob<JsonModule<Lesson[]>>("./*/lessons.json", { eager: true })
};

function bankPath(certId: string, bank: BankName): string {
  return `./${certId}/${bank}.json`;
}

function readBank<T>(cert: Certification, bank: BankName, required: boolean): T[] {
  const mod = bankModules[bank][bankPath(cert.id, bank)] as JsonModule<T[]> | undefined;
  if (!mod) {
    if (required) console.warn(`Missing bundled content bank: ${cert.id}/${bank}.json`);
    return [];
  }
  return mod.default;
}

function buildBundledContent(certifications: Certification[]): ContentBundle {
  return {
    certifications,
    domains: certifications.flatMap(cert => readBank<Domain>(cert, "domains", REQUIRED_BANKS.includes("domains"))),
    questions: certifications.flatMap(cert => readBank<Question>(cert, "questions", REQUIRED_BANKS.includes("questions"))),
    flashcards: certifications.flatMap(cert => readBank<Flashcard>(cert, "flashcards", REQUIRED_BANKS.includes("flashcards"))),
    pbqs: certifications.flatMap(cert => readBank<Pbq>(cert, "pbqs", false)),
    lessons: certifications.flatMap(cert => readBank<Lesson>(cert, "lessons", false))
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

/**
 * Loads the active content bundle. On the desktop build it prefers content read
 * by the Rust backend from bundled resource files. Any failure or malformed
 * payload falls back to the bundled content so the app always starts with a
 * valid bank.
 */
export async function loadContent(): Promise<ContentBundle> {
  if (!isTauri()) return bundledContent;
  try {
    const remote = await invoke<Partial<ContentBundle>>("load_content");
    const errors = validateContent(remote);
    if (errors.length) {
      console.warn("Backend content failed validation; using bundled content.", errors);
      return bundledContent;
    }
    return remote as ContentBundle;
  } catch (err) {
    console.warn("Could not load backend content; using bundled content.", err);
    return bundledContent;
  }
}
