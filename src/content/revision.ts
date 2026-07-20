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
 * Deterministic content-build identifier derived from bank item ids.
 * Used in diagnostics so support can tell whether two installs share the same
 * authored banks without requiring a manually bumped manifest field.
 */
export function contentRevision(content: ContentBundle): string {
  const parts = [
    ...content.certifications.map(c => `c:${c.id}`),
    ...content.domains.map(d => `d:${d.id}`),
    ...content.questions.map(q => `q:${q.id}`),
    ...content.flashcards.map(f => `f:${f.id}`),
    ...(content.pbqs ?? []).map(p => `p:${p.id}`),
    ...(content.lessons ?? []).map(l => `l:${l.id}`),
    ...(content.objectives ?? []).map(o => `o:${o.id}`)
  ].sort();
  const digest = fnv1a32(parts.join("|")).toString(16).padStart(8, "0");
  return `fnv1a-${digest}`;
}
