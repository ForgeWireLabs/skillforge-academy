import { describe, expect, it } from "vitest";
import { decryptBackup, encryptBackup, isEncryptedBackup } from "./backup";
import { migrateState } from "./logic";

describe("encrypted backups", () => {
  it("round-trips portable learner data", async () => {
    const state = { name: "Candidate", notes: [{ title: "Ports" }], streak: 4 };
    const raw = await encryptBackup(state, "correct horse battery staple");
    expect(isEncryptedBackup(JSON.parse(raw))).toBe(true);
    await expect(decryptBackup(raw, "correct horse battery staple")).resolves.toEqual(state);
  });

  it("round-trips representative multi-track learner state", async () => {
    const state = {
      schemaVersion: 3,
      name: "Jordan",
      activeCertId: "network-plus",
      progress: {
        "a-plus": { targetDate: "", dailyGoal: 10, streak: 2, lastStudyDate: "2026-06-21", dailyCounts: { "2026-06-21": 12 } },
        "network-plus": { targetDate: "2026-08-01", dailyGoal: 14, streak: 5, lastStudyDate: "2026-06-22", dailyCounts: { "2026-06-22": 8 } }
      },
      answered: { "netplus-q01": { correct: 2, attempts: 3, lastCorrect: true } },
      attempts: [{
        id: "attempt-1",
        certId: "network-plus",
        date: "2026-06-22T12:00:00.000Z",
        exam: "N10-009",
        score: 82,
        total: 100,
        durationSec: 5400,
        domainScores: { "netplus-networking-concepts": { correct: 12, total: 15 } },
        kind: "mock",
        passed: true
      }],
      bookmarks: ["netplus-q02"],
      lessonsRead: ["netplus-lesson-1"],
      notes: [{ id: "note-1", title: "Subnetting", body: "Watch borrowed bits.", updatedAt: "2026-06-22T12:00:00.000Z" }],
      cardRatings: { "netplus-f01": { ease: 2.6, interval: 4, due: "2026-06-26T00:00:00.000Z", reps: 2, lapses: 0 } },
      theme: "dark"
    };

    const raw = await encryptBackup(state, "cross platform passphrase");
    await expect(decryptBackup(raw, "cross platform passphrase")).resolves.toEqual(state);
  });

  it("rejects an incorrect passphrase", async () => {
    const raw = await encryptBackup({ private: true }, "correct-passphrase");
    await expect(decryptBackup(raw, "wrong-passphrase")).rejects.toThrow(/incorrect|damaged/i);
  });

  it("continues to read legacy plain JSON backups", async () => {
    await expect(decryptBackup('{"name":"Legacy"}', "")).resolves.toEqual({ name: "Legacy" });
  });

  it("lets legacy schema backups migrate after import", async () => {
    const imported = await decryptBackup(
      '{"schemaVersion":2,"answered":{"q01":{"correct":1,"attempts":1}},"bookmarks":["q02"],"cardRatings":{"f01":{"ease":2.4,"interval":4,"due":"2026-06-25T00:00:00.000Z"}}}',
      ""
    );
    const migrated = migrateState(imported);

    expect(migrated.answered["aplus-q01"].lastCorrect).toBe(true);
    expect(migrated.bookmarks).toEqual(["aplus-q02"]);
    expect(migrated.cardRatings["aplus-f01"].reps).toBe(0);
  });

  it("requires a meaningful export passphrase", async () => {
    await expect(encryptBackup({}, "short")).rejects.toThrow(/8 characters/i);
  });

  it("rejects malformed JSON backups with a safe error", async () => {
    await expect(decryptBackup("{", "")).rejects.toThrow(/valid JSON/i);
  });

  it("rejects unsupported encrypted backup versions", async () => {
    const raw = JSON.parse(await encryptBackup({ private: true }, "correct-passphrase"));
    raw.version = 2;

    await expect(decryptBackup(JSON.stringify(raw), "correct-passphrase")).rejects.toThrow(/unsupported|invalid/i);
  });

  it("rejects partial encrypted backup payloads without exposing decrypted data", async () => {
    const raw = JSON.parse(await encryptBackup({ private: true }, "correct-passphrase"));
    raw.data = raw.data.slice(0, -8);

    await expect(decryptBackup(JSON.stringify(raw), "correct-passphrase")).rejects.toThrow(/incorrect|damaged/i);
  });
});
