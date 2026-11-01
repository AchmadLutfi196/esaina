import { describe, expect, it } from "vitest";
import { createAssessmentSchema } from "./assessment";

const question = {
  order: 1,
  text: "Jelaskan.",
  referenceAnswer: "Acuan.",
  maxScore: 4,
  criteria: [{ code: "C1", description: "Definisi", minScore: 0, maxScore: 2 }],
};

describe("assessment DTO", () => {
  it("menerima payload valid", () => {
    expect(createAssessmentSchema.safeParse({ title: "UTS", questions: [question] }).success).toBe(true);
  });
  it("menolak nomor soal duplikat", () => {
    const result = createAssessmentSchema.safeParse({ title: "UTS", questions: [question, { ...question }] });
    expect(result.success).toBe(false);
  });
  it("menolak kode rubrik duplikat dalam satu soal", () => {
    const result = createAssessmentSchema.safeParse({
      title: "UTS",
      questions: [{ ...question, criteria: [question.criteria[0], question.criteria[0]] }],
    });
    expect(result.success).toBe(false);
  });
  it("menolak maxScore rubrik di bawah minScore", () => {
    const result = createAssessmentSchema.safeParse({
      title: "UTS",
      questions: [{ ...question, criteria: [{ ...question.criteria[0], minScore: 3, maxScore: 2 }] }],
    });
    expect(result.success).toBe(false);
  });
});
