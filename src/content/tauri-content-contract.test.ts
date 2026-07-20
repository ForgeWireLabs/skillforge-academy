import { describe, expect, it } from "vitest";
import { bundledContent } from "./index";
import { validateContent } from "./validate";

/**
 * The desktop `load_content` command reads the same `src/content` banks that
 * Vite bundles (copied into Tauri resources). These checks pin the contract
 * that Learning Paths depends on: `objectives` must be present and valid.
 * A matching Rust unit test lives in `src-tauri/src/lib.rs` (needs GTK on Linux).
 */
describe("Tauri content contract (shared banks)", () => {
  it("ships a non-empty objectives bank that validates", () => {
    expect(Array.isArray(bundledContent.objectives)).toBe(true);
    expect(bundledContent.objectives.length).toBeGreaterThan(0);
    expect(validateContent(bundledContent)).toEqual([]);
  });

  it("rejects the historical Tauri payload that omitted objectives", () => {
    const { objectives: _omit, ...withoutObjectives } = bundledContent;
    expect(
      validateContent(withoutObjectives).some(e => e.includes("objectives must be an array"))
    ).toBe(true);
  });
});
