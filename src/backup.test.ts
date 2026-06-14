import { describe, expect, it } from "vitest";
import { decryptBackup, encryptBackup, isEncryptedBackup } from "./backup";

describe("encrypted backups", () => {
  it("round-trips portable learner data", async () => {
    const state = { name: "Candidate", notes: [{ title: "Ports" }], streak: 4 };
    const raw = await encryptBackup(state, "correct horse battery staple");
    expect(isEncryptedBackup(JSON.parse(raw))).toBe(true);
    await expect(decryptBackup(raw, "correct horse battery staple")).resolves.toEqual(state);
  });

  it("rejects an incorrect passphrase", async () => {
    const raw = await encryptBackup({ private: true }, "correct-passphrase");
    await expect(decryptBackup(raw, "wrong-passphrase")).rejects.toThrow(/incorrect|damaged/i);
  });

  it("continues to read legacy plain JSON backups", async () => {
    await expect(decryptBackup('{"name":"Legacy"}', "")).resolves.toEqual({ name: "Legacy" });
  });

  it("requires a meaningful export passphrase", async () => {
    await expect(encryptBackup({}, "short")).rejects.toThrow(/8 characters/i);
  });
});
