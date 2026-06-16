import { describe, expect, it } from "vitest";
import {
  pct, formatTime, shuffle, dateKey, questionsToday, applyStudyActivity, recordAnswer,
  scheduleCard, isCardDue, domainMastery, masteredCount, objectiveStats, migrateState,
  buildNotifications, initialState, SCHEMA_VERSION,
  buildWeightedQuestionSet, buildMockExam, gradePbq, scoreMock, type MockItem
} from "./logic";
import type { AnsweredStat, CertProgress, Domain, LearnerState, Pbq, Question } from "./types";

const baseState = (over: Partial<LearnerState> = {}): LearnerState => ({ ...initialState, ...over });
const prog = (over: Partial<CertProgress> = {}): CertProgress => ({ targetDate: "", dailyGoal: 25, streak: 0, lastStudyDate: "", dailyCounts: {}, ...over });

const q = (id: string, domain: string, objective: string, exam: "220-1201" | "220-1202" = "220-1201"): Question => ({
  id, certId: "a-plus", exam, domain, difficulty: "Foundation", prompt: id, options: ["a", "b"], answer: 0, explanation: "x", objective
});

describe("pct / formatTime", () => {
  it("rounds percentages and guards divide-by-zero", () => {
    expect(pct(1, 4)).toBe(25);
    expect(pct(2, 3)).toBe(67);
    expect(pct(5, 0)).toBe(0);
  });
  it("formats mm:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
  });
});

describe("shuffle", () => {
  it("preserves all members", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]); // does not mutate input
  });
});

describe("streak (applyStudyActivity)", () => {
  it("starts a streak at 1 on first activity", () => {
    const r = applyStudyActivity(prog(), 3, "2026-06-13");
    expect(r.streak).toBe(1);
    expect(r.lastStudyDate).toBe("2026-06-13");
    expect(r.dailyCounts["2026-06-13"]).toBe(3);
  });
  it("increments on consecutive days", () => {
    expect(applyStudyActivity(prog({ streak: 4, lastStudyDate: "2026-06-12" }), 1, "2026-06-13").streak).toBe(5);
  });
  it("does not change the streak twice in one day but accumulates count", () => {
    const r = applyStudyActivity(prog({ streak: 5, lastStudyDate: "2026-06-13", dailyCounts: { "2026-06-13": 2 } }), 4, "2026-06-13");
    expect(r.streak).toBe(5);
    expect(r.dailyCounts["2026-06-13"]).toBe(6);
  });
  it("resets to 1 after a missed day", () => {
    expect(applyStudyActivity(prog({ streak: 9, lastStudyDate: "2026-06-10" }), 1, "2026-06-13").streak).toBe(1);
  });
});

describe("questionsToday", () => {
  it("reads the per-day counter", () => {
    const p = prog({ dailyCounts: { "2026-06-13": 7 } });
    expect(questionsToday(p, "2026-06-13")).toBe(7);
    expect(questionsToday(p, "2026-06-14")).toBe(0);
  });
});

describe("recordAnswer (recency)", () => {
  it("tracks cumulative counts and the latest correctness", () => {
    let a = recordAnswer(undefined, true);
    expect(a).toEqual({ correct: 1, attempts: 1, lastCorrect: true });
    a = recordAnswer(a, false);
    expect(a).toEqual({ correct: 1, attempts: 2, lastCorrect: false });
  });
});

describe("mastery", () => {
  const questions = [q("q1", "net", "ports"), q("q2", "net", "ports"), q("q3", "net", "wifi"), q("q4", "hw", "ram")];
  it("counts only questions whose latest attempt was correct, over the whole domain", () => {
    const answered: Record<string, AnsweredStat> = {
      q1: { correct: 1, attempts: 1, lastCorrect: true },
      q2: { correct: 5, attempts: 6, lastCorrect: false } // ground a lot but missed last -> not mastered
    };
    const net = questions.filter(x => x.domain === "net");
    expect(domainMastery(net, answered)).toBe(33); // 1 of 3 net questions
    expect(masteredCount(answered)).toBe(1);
  });
  it("surfaces weakest attempted objectives first", () => {
    const answered: Record<string, AnsweredStat> = {
      q1: { correct: 1, attempts: 1, lastCorrect: true },
      q2: { correct: 0, attempts: 1, lastCorrect: false },
      q3: { correct: 0, attempts: 1, lastCorrect: false }
    };
    const stats = objectiveStats(questions, answered);
    expect(stats[0].objective).toBe("wifi"); // 0% mastered
    expect(stats.map(s => s.objective)).not.toContain("ram"); // unattempted excluded
  });
});

describe("scheduleCard (SM-2)", () => {
  it("graduates intervals on repeated success and uses ease", () => {
    let c = scheduleCard(undefined, 3, 0); // Good
    expect(c.interval).toBe(1);
    expect(c.reps).toBe(1);
    c = scheduleCard(c, 3, 0);
    expect(c.interval).toBe(6);
    expect(c.reps).toBe(2);
    const third = scheduleCard(c, 3, 0);
    expect(third.interval).toBeGreaterThan(6); // 6 * ease
    expect(third.reps).toBe(3);
  });
  it("resets interval and counts a lapse on Again", () => {
    let c = scheduleCard(undefined, 4, 0);
    c = scheduleCard(c, 4, 0);
    const lapsed = scheduleCard(c, 1, 0); // Again
    expect(lapsed.interval).toBe(1);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
  });
  it("never lets ease drop below 1.3", () => {
    let c = scheduleCard(undefined, 1, 0);
    for (let i = 0; i < 10; i++) c = scheduleCard(c, 1, 0);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe("isCardDue", () => {
  it("treats unseen cards as due and respects due dates", () => {
    const now = new Date("2026-06-13T12:00:00Z");
    expect(isCardDue(undefined, now)).toBe(true);
    expect(isCardDue({ ease: 2.5, interval: 1, reps: 1, lapses: 0, due: "2026-06-12T00:00:00Z" }, now)).toBe(true);
    expect(isCardDue({ ease: 2.5, interval: 1, reps: 1, lapses: 0, due: "2026-06-20T00:00:00Z" }, now)).toBe(false);
  });
});

describe("migrateState", () => {
  it("fills defaults for an empty/garbage save", () => {
    const s = migrateState(null);
    expect(s.schemaVersion).toBe(SCHEMA_VERSION);
    expect(s.activeCertId).toBe("a-plus");
    expect(s.progress["a-plus"].streak).toBe(0);
    expect(s.answered).toEqual({});
    expect(s.theme).toBe("dark");
  });
  it("upgrades a legacy v1 record (no lastCorrect / reps / dailyCounts)", () => {
    const legacy = {
      name: "Tech", dailyGoal: 25, streak: 3, theme: "light",
      answered: { q1: { correct: 2, attempts: 3 } },
      cardRatings: { f1: { ease: 2.4, interval: 4, due: "2026-06-20T00:00:00Z" } }
    };
    const s = migrateState(legacy);
    expect(s.theme).toBe("light");
    // pre-v3 content ids are namespaced under "aplus-" on upgrade
    expect(s.answered["aplus-q1"].lastCorrect).toBe(true); // best-effort from correct>0
    expect(s.cardRatings["aplus-f1"].reps).toBe(0);
    expect(s.cardRatings["aplus-f1"].lapses).toBe(0);
    // legacy top-level cadence folds into the default A+ track
    expect(s.activeCertId).toBe("a-plus");
    expect(s.progress["a-plus"].streak).toBe(3);
    expect(s.progress["a-plus"].dailyCounts).toEqual({});
  });
  it("drops corrupt fields without throwing", () => {
    const s = migrateState({ answered: "nope", attempts: 42, bookmarks: [1, "ok", null] });
    expect(s.answered).toEqual({});
    expect(s.attempts).toEqual([]);
    expect(s.bookmarks).toEqual(["aplus-ok"]); // surviving bookmark is re-keyed
  });
  it("re-keys all content ids under aplus- when upgrading a pre-v3 save", () => {
    const s = migrateState({
      schemaVersion: 2,
      answered: { q01: { correct: 1, attempts: 1, lastCorrect: true } },
      cardRatings: { f01: { ease: 2.5, interval: 1, due: "", reps: 1, lapses: 0 } },
      bookmarks: ["q02"],
      attempts: [{ id: "a", date: "", exam: "220-1201", score: 1, total: 1, durationSec: 1, domainScores: { mobile: { correct: 1, total: 1 } } }]
    });
    expect(Object.keys(s.answered)).toEqual(["aplus-q01"]);
    expect(Object.keys(s.cardRatings)).toEqual(["aplus-f01"]);
    expect(s.bookmarks).toEqual(["aplus-q02"]);
    expect(Object.keys(s.attempts[0].domainScores)).toEqual(["aplus-mobile"]);
  });
  it("leaves an already-migrated v3 save untouched (idempotent)", () => {
    const s = migrateState({
      schemaVersion: 3,
      answered: { "aplus-q01": { correct: 1, attempts: 1, lastCorrect: true } },
      bookmarks: ["aplus-q02"]
    });
    expect(Object.keys(s.answered)).toEqual(["aplus-q01"]); // no double prefix
    expect(s.bookmarks).toEqual(["aplus-q02"]);
  });
});

describe("mock exam: weighted selection", () => {
  const domains: Domain[] = [
    { id: "net", certId: "a-plus", exam: "220-1201", name: "Networking", weight: 75, color: "#000", description: "", topics: [] },
    { id: "hw", certId: "a-plus", exam: "220-1201", name: "Hardware", weight: 25, color: "#000", description: "", topics: [] }
  ];
  const questions: Question[] = [
    ...Array.from({ length: 8 }, (_, i) => q(`n${i}`, "net", "obj")),
    ...Array.from({ length: 4 }, (_, i) => q(`h${i}`, "hw", "obj"))
  ];
  it("distributes questions in proportion to domain weight", () => {
    const set = buildWeightedQuestionSet(questions, domains, "220-1201", 4);
    expect(set).toHaveLength(4);
    expect(set.filter(x => x.domain === "net")).toHaveLength(3); // 75%
    expect(set.filter(x => x.domain === "hw")).toHaveLength(1); // 25%
  });
  it("never exceeds the available pool", () => {
    expect(buildWeightedQuestionSet(questions, domains, "220-1201", 100)).toHaveLength(12);
  });
  it("returns unique questions", () => {
    const set = buildWeightedQuestionSet(questions, domains, "220-1201", 10);
    expect(new Set(set.map(x => x.id)).size).toBe(set.length);
  });
});

describe("PBQ grading (partial credit)", () => {
  const matching: Pbq = {
    id: "m", certId: "a-plus", kind: "matching", exam: "220-1201", domain: "net", difficulty: "Foundation", prompt: "", objective: "", explanation: "",
    items: [{ id: "a", text: "A" }, { id: "b", text: "B" }, { id: "c", text: "C" }, { id: "d", text: "D" }],
    targets: [{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }],
    answer: { a: "1", b: "2", c: "3", d: "4" }
  };
  const ordering: Pbq = {
    id: "o", certId: "a-plus", kind: "ordering", exam: "220-1201", domain: "net", difficulty: "Foundation", prompt: "", objective: "", explanation: "",
    steps: [{ id: "s1", text: "1" }, { id: "s2", text: "2" }, { id: "s3", text: "3" }, { id: "s4", text: "4" }],
    answer: ["s1", "s2", "s3", "s4"]
  };
  it("scores matching by fraction correct", () => {
    expect(gradePbq(matching, { a: "1", b: "2", c: "3", d: "4" })).toBe(1);
    expect(gradePbq(matching, { a: "1", b: "2", c: "9", d: "9" })).toBe(0.5);
    expect(gradePbq(matching, {})).toBe(0);
  });
  it("scores ordering by correct positions", () => {
    expect(gradePbq(ordering, ["s1", "s2", "s3", "s4"])).toBe(1);
    expect(gradePbq(ordering, ["s2", "s1", "s3", "s4"])).toBe(0.5); // last two correct
    expect(gradePbq(ordering, [])).toBe(0);
  });
});

describe("mock exam: scoring and assembly", () => {
  const pbq: Pbq = {
    id: "p1", certId: "a-plus", kind: "ordering", exam: "220-1201", domain: "net", difficulty: "Foundation", prompt: "", objective: "", explanation: "",
    steps: [{ id: "s1", text: "1" }, { id: "s2", text: "2" }], answer: ["s1", "s2"]
  };
  const items: MockItem[] = [
    { type: "mcq", question: q("q1", "net", "obj") },
    { type: "mcq", question: q("q2", "hw", "obj") },
    { type: "pbq", pbq }
  ];
  it("blends MCQ (1/0) and PBQ (partial) scores and applies the pass line", () => {
    const g = scoreMock(items, { q1: 0, q2: 1 }, { p1: ["s1", "s2"] }); // q1 correct, q2 wrong, pbq full
    expect(g.total).toBe(3);
    expect(g.earned).toBe(2); // 1 + 0 + 1
    expect(g.pct).toBe(67);
    expect(g.passed).toBe(false); // below 75%
    expect(g.domainScores.net.total).toBe(2);
  });
  it("passes at or above the threshold", () => {
    const g = scoreMock(items, { q1: 0, q2: 0 }, { p1: ["s1", "s2"] }); // both MCQ correct + full PBQ = 3/3
    expect(g.passed).toBe(true);
    expect(g.pct).toBe(100);
  });
  it("honors a caller-provided pass threshold", () => {
    const g = scoreMock(items, { q1: 0, q2: 1 }, { p1: ["s1", "s2"] }, 0.6);
    expect(g.pct).toBe(67);
    expect(g.passed).toBe(true);
  });
  it("places PBQs before MCQs in a built exam", () => {
    const domains: Domain[] = [{ id: "net", certId: "a-plus", exam: "220-1201", name: "Networking", weight: 100, color: "#000", description: "", topics: [] }];
    const qs = Array.from({ length: 5 }, (_, i) => q(`q${i}`, "net", "obj"));
    const exam = buildMockExam(qs, [pbq], domains, "220-1201", 3, 1);
    expect(exam[0].type).toBe("pbq");
    expect(exam.filter(i => i.type === "mcq")).toHaveLength(3);
  });
});

describe("buildNotifications", () => {
  const content = { flashcards: [{ id: "f1", certId: "a-plus", domain: "net", front: "x", back: "y" }] };
  it("reports due cards, remaining goal, countdown, and baseline prompt", () => {
    const now = new Date("2026-06-13T12:00:00Z");
    const s = baseState({ progress: { "a-plus": prog({ dailyGoal: 10, targetDate: "2026-06-20" }) } });
    const notes = buildNotifications(s, content, now);
    const ids = notes.map(n => n.id);
    expect(ids).toContain("cards-due");
    expect(ids).toContain("daily-goal");
    expect(ids).toContain("exam-countdown");
    expect(ids).toContain("baseline");
  });
  it("clears the daily-goal note once the goal is met", () => {
    const now = new Date("2026-06-13T12:00:00Z");
    const s = baseState({ progress: { "a-plus": prog({ dailyGoal: 5, dailyCounts: { [dateKey(now)]: 5 } }) }, attempts: [{ id: "a", certId: "a-plus", date: "", exam: "Mixed", score: 5, total: 5, durationSec: 1, domainScores: {} }] });
    const ids = buildNotifications(s, content, now).map(n => n.id);
    expect(ids).not.toContain("daily-goal");
    expect(ids).not.toContain("baseline");
  });
});
