import { describe, expect, it } from "vitest";
import { validateAiPayload } from "./prompt";

const questions = [{ id: "q1", text: "Soal", referenceAnswer: "Acuan", answer: "Jawaban", criteria: [{ id: "c1", code: "C1", description: "Definisi", minScore: 0, maxScore: 2 }] }];
const item = { questionId: "q1", criterionId: "c1", score: 2, evidence: "Jawaban", rationale: "Cukup", feedback: "Baik" };

describe("AI payload validator", () => {
  it("menerima payload lengkap valid", () => expect(validateAiPayload({ items: [item] }, questions).items).toHaveLength(1));
  it("menolak skor di luar rubrik", () => expect(() => validateAiPayload({ items: [{ ...item, score: 3 }] }, questions)).toThrow());
  it("menolak ID asing", () => expect(() => validateAiPayload({ items: [{ ...item, criterionId: "foreign" }] }, questions)).toThrow());
  it("menolak kriteria hilang", () => expect(() => validateAiPayload({ items: [] }, questions)).toThrow());
  it("menolak kriteria duplikat", () => expect(() => validateAiPayload({ items: [item, item] }, questions)).toThrow());
});
