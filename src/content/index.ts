import { invoke } from "@tauri-apps/api/core";
import type { Certification, Domain, Flashcard, Pbq, Question } from "../types";
import { validateContent, type ContentBundle } from "./validate";
import certificationsJson from "./certifications.json";
import aplusDomains from "./a-plus/domains.json";
import aplusQuestions from "./a-plus/questions.json";
import aplusFlashcards from "./a-plus/flashcards.json";
import aplusPbqs from "./a-plus/pbqs.json";

export type { ContentBundle } from "./validate";

/**
 * Bundled content shipped with the app. Acts as the offline fallback and as
 * the source consumed by tests and the validation script. Each certification's
 * banks live under its own directory and are concatenated into flat arrays
 * tagged by `certId`; add a track by importing its banks and spreading them in.
 */
export const bundledContent: ContentBundle = {
  certifications: certificationsJson as Certification[],
  domains: [...(aplusDomains as Domain[])],
  questions: [...(aplusQuestions as Question[])],
  flashcards: [...(aplusFlashcards as Flashcard[])],
  pbqs: [...(aplusPbqs as Pbq[])]
};

function isTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Loads the active content bundle. On the desktop build it prefers content
 * read by the Rust backend from bundled resource files, which lets the
 * question/flashcard banks be updated without rebuilding the app. Any failure
 * or malformed payload falls back to the bundled content so the app always
 * starts with a valid bank.
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
    // A backend that predates the cert manifest or PBQs may omit them; fall back
    // to the bundled sets for any missing top-level field.
    return { certifications: bundledContent.certifications, pbqs: bundledContent.pbqs, ...remote } as ContentBundle;
  } catch (err) {
    console.warn("Could not load backend content; using bundled content.", err);
    return bundledContent;
  }
}
