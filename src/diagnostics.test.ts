import { describe, expect, it, beforeEach } from "vitest";
import {
  APP_VERSION,
  DIAGNOSTIC_FORMAT,
  buildDiagnosticBundle,
  clearDiagnosticErrors,
  getRecentDiagnosticErrors,
  recordDiagnosticError,
  serializeDiagnosticBundle
} from "./diagnostics";
import { contentRevision } from "./content/revision";
import { bundledContent } from "./content";
import { initialState, migrateState, SCHEMA_VERSION } from "./logic";
import type { LearnerState } from "./types";

const sampleState = (): LearnerState => ({
  ...initialState,
  name: "Jordan Learner",
  notes: [
    { id: "n1", title: "Ports to remember", body: "22 SSH, 443 HTTPS — private study notes", updatedAt: "2026-07-01T00:00:00.000Z" }
  ],
  answered: { "aplus-q01": { correct: 1, attempts: 2, lastCorrect: true } },
  bookmarks: ["aplus-q01"],
  attempts: [
    {
      id: "a1",
      certId: "a-plus",
      date: "2026-07-01",
      exam: "220-1201",
      score: 8,
      total: 10,
      durationSec: 120,
      domainScores: {},
      kind: "practice"
    }
  ]
});

describe("diagnostic error ring", () => {
  beforeEach(() => clearDiagnosticErrors());

  it("records recent errors without throwing", () => {
    recordDiagnosticError("save_state", new Error("disk full"));
    recordDiagnosticError("import_backup", "bad passphrase");
    const errors = getRecentDiagnosticErrors();
    expect(errors).toHaveLength(2);
    expect(errors[0].source).toBe("save_state");
    expect(errors[0].message).toBe("disk full");
    expect(errors[1].message).toBe("bad passphrase");
  });

  it("caps the ring at 50 entries", () => {
    for (let i = 0; i < 60; i++) recordDiagnosticError("test", `err-${i}`);
    const errors = getRecentDiagnosticErrors();
    expect(errors).toHaveLength(50);
    expect(errors[0].message).toBe("err-10");
    expect(errors[49].message).toBe("err-59");
  });
});

describe("buildDiagnosticBundle", () => {
  beforeEach(() => clearDiagnosticErrors());

  it("declares the no-telemetry local-export stance", () => {
    const bundle = buildDiagnosticBundle(sampleState(), {
      content: bundledContent,
      platform: { userAgent: "test", language: "en", online: false, tauri: true, androidBridge: false, viewport: { width: 1280, height: 800 } },
      now: () => new Date("2026-07-20T12:00:00.000Z")
    });
    expect(bundle.format).toBe(DIAGNOSTIC_FORMAT);
    expect(bundle.app.version).toBe(APP_VERSION);
    expect(bundle.app.schemaVersion).toBe(SCHEMA_VERSION);
    expect(bundle.stance).toEqual({
      telemetry: "none",
      crashReporting: "none",
      transport: "local-export-only"
    });
    expect(bundle.platform.tauri).toBe(true);
    expect(bundle.content.totals.questions).toBeGreaterThan(0);
    expect(bundle.content.revision).toMatch(/^fnv1a-[0-9a-f]{8}$/);
    expect(bundle.content.revision).toBe(contentRevision(bundledContent));
  });

  it("redacts display name and note text by default", () => {
    recordDiagnosticError("export_backup", new Error("passphrase too short"));
    const bundle = buildDiagnosticBundle(sampleState(), { content: bundledContent });
    expect(bundle.state.name).toBeUndefined();
    expect(bundle.state.notes).toBeUndefined();
    expect(bundle.state.counts.notes).toBe(1);
    expect(bundle.state.counts.answered).toBe(1);
    expect(bundle.recentErrors).toHaveLength(1);
    expect(bundle.redaction.includeSensitive).toBe(false);
    expect(serializeDiagnosticBundle(bundle)).not.toContain("Jordan Learner");
    expect(serializeDiagnosticBundle(bundle)).not.toContain("private study notes");
  });

  it("includes sensitive learner content only when explicitly requested", () => {
    const bundle = buildDiagnosticBundle(sampleState(), { includeSensitive: true });
    expect(bundle.state.name).toBe("Jordan Learner");
    expect(bundle.state.notes?.[0].body).toContain("private study notes");
    expect(bundle.redaction.includeSensitive).toBe(true);
  });

  it("does not mutate learner state while building a bundle", () => {
    const state = sampleState();
    const before = JSON.stringify(state);
    buildDiagnosticBundle(state, { includeSensitive: true, content: bundledContent });
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe("failure path state safety", () => {
  it("migrates malformed saves into a usable state without throwing", () => {
    const recovered = migrateState({
      schemaVersion: "nope",
      name: 42,
      answered: "bad",
      attempts: [{ id: "x" }],
      notes: null,
      progress: []
    });
    expect(recovered.schemaVersion).toBe(SCHEMA_VERSION);
    expect(typeof recovered.name).toBe("string");
    expect(recovered.answered).toEqual({});
    expect(Array.isArray(recovered.attempts)).toBe(true);
    expect(Array.isArray(recovered.notes)).toBe(true);
  });

  it("keeps a diagnostic export usable after a simulated import failure message", () => {
    clearDiagnosticErrors();
    const before = sampleState();
    // Import failures in Preferences catch before setState; only the error ring changes.
    recordDiagnosticError("import_backup", new Error("The passphrase is incorrect or the backup is damaged."));
    const bundle = buildDiagnosticBundle(before);
    expect(bundle.recentErrors[0].message).toMatch(/passphrase|damaged/i);
    expect(before.notes[0].body).toContain("private study notes");
    expect(bundle.state.counts.notes).toBe(1);
  });
});
