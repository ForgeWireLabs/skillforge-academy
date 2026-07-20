import { describe, expect, it } from "vitest";
import { contentRevision } from "./revision";
import { bundledContent } from "./index";
import type { ContentBundle } from "./validate";

describe("contentRevision", () => {
  it("returns a stable fnv1a fingerprint for the bundled banks", () => {
    const a = contentRevision(bundledContent);
    const b = contentRevision(bundledContent);
    expect(a).toMatch(/^fnv1a-[0-9a-f]{8}$/);
    expect(a).toBe(b);
  });

  it("changes when bank membership changes", () => {
    const base = contentRevision(bundledContent);
    const mutated: ContentBundle = {
      ...bundledContent,
      questions: bundledContent.questions.slice(0, -1)
    };
    expect(contentRevision(mutated)).not.toBe(base);
  });

  it("changes when authored fields change while ids stay the same", () => {
    const base = contentRevision(bundledContent);
    const [first, ...rest] = bundledContent.questions;
    const mutated: ContentBundle = {
      ...bundledContent,
      questions: [{ ...first, explanation: `${first.explanation} [revised]` }, ...rest]
    };
    expect(mutated.questions[0].id).toBe(first.id);
    expect(contentRevision(mutated)).not.toBe(base);
  });
});
