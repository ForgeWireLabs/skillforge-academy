import { describe, expect, it } from "vitest";
import { validateContent, type ContentBundle } from "./validate";
import type { Certification, Domain, Flashcard, Question } from "../types";

// A minimal, structurally valid single-track bundle that individual tests mutate.
const aPlus: Certification = {
  id: "a-plus", name: "CompTIA A+", shortName: "A+", vendor: "CompTIA", idPrefix: "aplus",
  description: "", passThreshold: 0.75,
  exams: [{ id: "220-1201", certId: "a-plus", name: "Core 1", defaultQuestions: 90, defaultMinutes: 90 }]
};
const domain: Domain = { id: "aplus-net", certId: "a-plus", exam: "220-1201", name: "Networking", weight: 100, color: "#000", description: "", topics: [] };
const question: Question = { id: "aplus-q1", certId: "a-plus", exam: "220-1201", domain: "aplus-net", difficulty: "Foundation", prompt: "p", options: ["a", "b"], answer: 0, explanation: "x", objective: "o" };
const flashcard: Flashcard = { id: "aplus-f1", certId: "a-plus", domain: "aplus-net", front: "f", back: "b" };

const bundle = (over: Partial<ContentBundle> = {}): ContentBundle => ({
  certifications: [aPlus], domains: [domain], questions: [question], flashcards: [flashcard], pbqs: [], lessons: [], objectives: [], ...over
});

describe("validateContent — track availability and ordering", () => {
  it("accepts a sound single-track bundle", () => {
    expect(validateContent(bundle())).toEqual([]);
  });

  it("accepts a coming-soon track with no authored banks", () => {
    const soon: Certification = { ...aPlus, id: "security-plus", shortName: "Security+", idPrefix: "secplus", status: "coming-soon", order: 3, exams: [{ id: "sy0-701", certId: "security-plus", name: "", defaultQuestions: 90, defaultMinutes: 90 }] };
    // Note: no security-plus domains/questions/flashcards are supplied.
    expect(validateContent(bundle({ certifications: [aPlus, soon] }))).toEqual([]);
  });

  it("still requires banks for an available track", () => {
    const empty: Certification = { ...aPlus, id: "network-plus", shortName: "Network+", idPrefix: "netplus", exams: [{ id: "n10-009", certId: "network-plus", name: "", defaultQuestions: 90, defaultMinutes: 90 }] };
    const errors = validateContent(bundle({ certifications: [aPlus, empty] }));
    expect(errors.some(e => e.includes("network-plus") && e.includes("missing required"))).toBe(true);
  });

  it("rejects an invalid status", () => {
    const bad = { ...aPlus, status: "soon" } as unknown as Certification;
    expect(validateContent(bundle({ certifications: [bad] })).some(e => e.includes("status must be"))).toBe(true);
  });

  it("rejects two tracks sharing an idPrefix", () => {
    // A second track reusing A+'s prefix would make content ids ambiguous across tracks.
    const clash: Certification = { ...aPlus, id: "network-plus", shortName: "Network+", status: "coming-soon", exams: [{ id: "n10-009", certId: "network-plus", name: "", defaultQuestions: 90, defaultMinutes: 90 }] };
    const errors = validateContent(bundle({ certifications: [aPlus, clash] }));
    expect(errors.some(e => e.includes("idPrefix") && e.includes("already used by"))).toBe(true);
  });

  it("rejects a non-numeric order", () => {
    const bad = { ...aPlus, order: "first" } as unknown as Certification;
    expect(validateContent(bundle({ certifications: [bad] })).some(e => e.includes("order must be a number"))).toBe(true);
  });
});

describe("validateContent — objective registry", () => {
  const objective = { id: "aplus-1.1", certId: "a-plus", exam: "220-1201", domain: "aplus-net", code: "1.1", title: "Sample objective", verified: false };

  it("accepts objectives and content that references a valid objectiveId", () => {
    const q = { ...question, objectiveId: "aplus-1.1" };
    expect(validateContent(bundle({ objectives: [objective], questions: [q] }))).toEqual([]);
  });

  it("rejects content referencing an unknown objectiveId", () => {
    const q = { ...question, objectiveId: "aplus-9.9" };
    expect(validateContent(bundle({ objectives: [objective], questions: [q] })).some(e => e.includes("unknown objectiveId"))).toBe(true);
  });

  it("rejects an objective pointing at an unknown domain", () => {
    const bad = { ...objective, domain: "aplus-nope" };
    expect(validateContent(bundle({ objectives: [bad] })).some(e => e.includes("unknown domain"))).toBe(true);
  });

  it("rejects a payload that omits the objectives array (Tauri crash guard)", () => {
    const { objectives: _omit, ...without } = bundle();
    expect(validateContent(without).some(e => e.includes("objectives must be an array"))).toBe(true);
  });

  it("accepts an explicit empty objectives array", () => {
    expect(validateContent(bundle({ objectives: [] }))).toEqual([]);
  });
});

describe("validateContent — PBQ formats", () => {
  it("accepts a valid fill-in PBQ", () => {
    expect(validateContent(bundle({
      pbqs: [{
        id: "aplus-p1", certId: "a-plus", kind: "fillin", exam: "220-1201", domain: "aplus-net",
        difficulty: "Foundation", prompt: "Type the HTTPS port.", objective: "o", explanation: "HTTPS uses 443.",
        blanks: [{ id: "port", label: "HTTPS port", accept: ["443"] }]
      }]
    }))).toEqual([]);
  });

  it("accepts a valid categorization PBQ", () => {
    expect(validateContent(bundle({
      pbqs: [{
        id: "aplus-p2", certId: "a-plus", kind: "categorization", exam: "220-1201", domain: "aplus-net",
        difficulty: "Intermediate", prompt: "Sort the symptoms.", objective: "o", explanation: "Physical symptoms differ from DNS symptoms.",
        categories: [{ id: "physical", label: "Physical" }, { id: "dns", label: "DNS" }],
        items: [{ id: "link", text: "Link light is dark" }, { id: "lookup", text: "Name lookup fails" }],
        answer: { link: "physical", lookup: "dns" }
      }]
    }))).toEqual([]);
  });

  it("rejects fill-in PBQs with duplicate or empty accepted answers", () => {
    const errors = validateContent(bundle({
      pbqs: [{
        id: "aplus-p1", certId: "a-plus", kind: "fillin", exam: "220-1201", domain: "aplus-net",
        difficulty: "Foundation", prompt: "Type values.", objective: "o", explanation: "x",
        blanks: [
          { id: "same", label: "One", accept: ["443"] },
          { id: "same", label: "Two", accept: [""] }
        ]
      }]
    }));
    expect(errors.some(e => e.includes("blank ids must be present and unique"))).toBe(true);
    expect(errors.some(e => e.includes("needs non-empty accepted answers"))).toBe(true);
  });

  it("rejects categorization PBQs with bad category references", () => {
    const errors = validateContent(bundle({
      pbqs: [{
        id: "aplus-p2", certId: "a-plus", kind: "categorization", exam: "220-1201", domain: "aplus-net",
        difficulty: "Intermediate", prompt: "Sort the symptoms.", objective: "o", explanation: "x",
        categories: [{ id: "physical", label: "Physical" }],
        items: [{ id: "link", text: "Link light is dark" }],
        answer: { link: "dns", ghost: "physical" }
      }]
    }));
    expect(errors.some(e => e.includes("unknown category"))).toBe(true);
    expect(errors.some(e => e.includes("unknown item"))).toBe(true);
  });
});
