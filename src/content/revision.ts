import type { ContentBundle } from "./validate";

/** FNV-1a 32-bit — sync, deterministic, no crypto dependency. */
function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Deterministic JSON with sorted object keys so field edits change the digest
 * even when array order differs across loaders.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/** Sort bank items by id, then serialize every field (not id alone). */
function bankFingerprint(items: { id: string }[]): string {
  return [...items]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(item => stableStringify(item))
    .join("|");
}

/**
 * Deterministic content-build identifier derived from the full authored banks.
 * Used in diagnostics so support can tell whether two installs share the same
 * authored content set — including wording, answers, and explanations — without
 * a manually bumped manifest field.
 */
export function contentRevision(content: ContentBundle): string {
  const parts = [
    `certifications:${bankFingerprint(content.certifications)}`,
    `domains:${bankFingerprint(content.domains)}`,
    `questions:${bankFingerprint(content.questions)}`,
    `flashcards:${bankFingerprint(content.flashcards)}`,
    `pbqs:${bankFingerprint(content.pbqs ?? [])}`,
    `lessons:${bankFingerprint(content.lessons ?? [])}`,
    `objectives:${bankFingerprint(content.objectives ?? [])}`
  ];
  const digest = fnv1a32(parts.join("||")).toString(16).padStart(8, "0");
  return `fnv1a-${digest}`;
}
