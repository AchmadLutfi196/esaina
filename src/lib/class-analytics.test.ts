import { describe, expect, it } from "vitest";
import type { Assessment, StudentSubmission } from "@/types";
import {
  buildDistribution,
  buildTrends,
  classStats,
  maxScoreOf,
  rawScoreOf,
  scoreCellOf,
} from "@/lib/class-analytics";

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "asm-1",
    classId: "cls-1",
    title: "PTS Biologi",
    code: "ASM1",
    subject: "Biologi",
    status: "active",
    publicationStatus: "unpublished",
    dueDate: "2026-11-05T00:00:00.000Z",
    durationMinutes: 60,
    raterCount: 1,
    instructions: "Jawab esai.",
    questions: [
      {
        id: 1,
        prompt: "Soal 1",
        maxScore: 6,
        expectedKeywords: [],
        rubric: [],
      },
      {
        id: 2,
        prompt: "Soal 2",
        maxScore: 4,
        expectedKeywords: [],
        rubric: [],
      },
    ],
    submissions: [],
    ...overrides,
  };
}

function makeSubmission(overrides: Partial<StudentSubmission> = {}): StudentSubmission {
  return {
    id: "sub-1",
    studentId: "stu-1",
    studentName: "Aisyah",
    studentNis: "20261000",
    submittedAt: "2026-10-31T00:00:00.000Z",
    statusWork: "submitted",
    statusGrading: "final",
    raterName: "Guru",
    answers: {
      1: {
        questionId: 1,
        studentAnswer: "Jawaban",
        wordCount: 1,
        lastUpdated: "2026-10-31T00:00:00.000Z",
        scores: { c1: 2, c2: 2, c3: 2 },
        teacherFeedback: "",
      },
      2: {
        questionId: 2,
        studentAnswer: "Jawaban",
        wordCount: 1,
        lastUpdated: "2026-10-31T00:00:00.000Z",
        scores: { c1: 2, c2: 2 },
        teacherFeedback: "",
      },
    },
    publishedScore: null,
    ...overrides,
  };
}

describe("maxScoreOf", () => {
  it("menjumlahkan skor maksimum seluruh soal", () => {
    expect(maxScoreOf(makeAssessment())).toBe(10);
  });

  it("jatuh ke 100 bila soal belum memiliki skor", () => {
    expect(maxScoreOf(makeAssessment({ questions: [] }))).toBe(100);
  });
});

describe("rawScoreOf", () => {
  it("tidak menghitung nol untuk jawaban yang belum dikumpulkan", () => {
    const sub = makeSubmission({ statusWork: "draft" });
    expect(rawScoreOf(sub)).toBeNull();
  });

  it("menghitung total dari item nilai", () => {
    expect(rawScoreOf(makeSubmission())).toBe(10);
  });

  it("mengutamakan nilai terbit bila tersedia", () => {
    expect(rawScoreOf(makeSubmission({ publishedScore: 8 }))).toBe(8);
  });

  it("mengembalikan null saat belum ada kriteria dinilai", () => {
    const sub = makeSubmission({
      answers: {
        1: {
          questionId: 1,
          studentAnswer: "x",
          wordCount: 1,
          lastUpdated: "",
          scores: {},
          teacherFeedback: "",
        },
      },
    });
    expect(rawScoreOf(sub)).toBeNull();
  });
});

describe("scoreCellOf", () => {
  it("menandai siswa yang belum mengumpulkan", () => {
    const cell = scoreCellOf(undefined, makeAssessment());
    expect(cell.state).toBe("not_submitted");
    expect(cell.percent).toBeNull();
  });

  it("menghitung persentase terhadap skor maksimum", () => {
    const cell = scoreCellOf(makeSubmission(), makeAssessment());
    expect(cell).toMatchObject({ raw: 10, max: 10, percent: 100, state: "final" });
  });

  it("mempertahankan status draf penilaian", () => {
    const cell = scoreCellOf(
      makeSubmission({ statusGrading: "draft_graded" }),
      makeAssessment()
    );
    expect(cell.state).toBe("draft");
  });
});

describe("buildDistribution", () => {
  it("mengelompokkan persentase ke dalam lima rentang", () => {
    const bins = buildDistribution([
      { name: "A", percent: 100 },
      { name: "B", percent: 82 },
      { name: "C", percent: 70 },
      { name: "D", percent: 59 },
      { name: "E", percent: 0 },
    ]);
    expect(bins.map((b) => b.count)).toEqual([2, 0, 1, 1, 1]);
    expect(bins[4].students[0].name).toBe("A");
  });
});

describe("classStats", () => {
  it("mengosongkan statistik saat belum ada nilai", () => {
    expect(classStats([]).mean).toBeNull();
  });

  it("menghitung rerata, rentang, dan ketuntasan", () => {
    expect(classStats([100, 50, 80, 70])).toEqual({
      mean: 75,
      highest: 100,
      lowest: 50,
      passRate: 75,
      gradedCount: 4,
    });
  });
});

describe("buildTrends", () => {
  it("melewati asesmen tanpa nilai", () => {
    const assessment = makeAssessment();
    const trends = buildTrends([assessment], (sub, asm) => {
      const cell = scoreCellOf(sub, asm);
      return cell.percent;
    });
    expect(trends).toEqual([]);
  });

  it("menghitung rerata per asesmen pada urutan kronologis", () => {
    const older = makeAssessment({
      id: "asm-old",
      submissions: [makeSubmission({ id: "s1" })],
    });
    const newer = makeAssessment({
      id: "asm-new",
      submissions: [makeSubmission({ id: "s2", publishedScore: 5 })],
    });
    const trends = buildTrends([newer, older], (sub, asm) => {
      const raw = rawScoreOf(sub);
      return raw === null ? null : Math.round((raw / maxScoreOf(asm)) * 100);
    });
    expect(trends.map((t) => t.average)).toEqual([100, 50]);
  });
});
