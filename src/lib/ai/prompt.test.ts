import { describe, expect, it } from "vitest";
import { cacheKey, validateAiPayload } from "./prompt";

const questions = [{ id: "q1", text: "Soal", referenceAnswer: "Acuan", answer: "Jawaban", criteria: [{ id: "c1", code: "C1", description: "Definisi", minScore: 0, maxScore: 2 }] }];
const item = { questionId: "q1", criterionId: "c1", score: 2, evidence: "Jawaban", rationale: "Cukup", feedback: "Baik" };

describe("AI payload validator", () => {
  it("menerima payload lengkap valid", () => expect(validateAiPayload({ items: [item] }, questions).items).toHaveLength(1));
  it("menolak skor di luar rubrik", () => expect(() => validateAiPayload({ items: [{ ...item, score: 3 }] }, questions)).toThrow());
  it("menolak ID asing", () => expect(() => validateAiPayload({ items: [{ ...item, criterionId: "foreign" }] }, questions)).toThrow());
  it("menolak kriteria hilang", () => expect(() => validateAiPayload({ items: [] }, questions)).toThrow());
  it("menolak kriteria duplikat", () => expect(() => validateAiPayload({ items: [item, item] }, questions)).toThrow());
  it("menolak evidence yang bukan kutipan jawaban", () => expect(() => validateAiPayload({ items: [{ ...item, evidence: "Kalimat asing" }] }, questions)).toThrow());
  it("menerima evidence kutipan persis", () => expect(validateAiPayload({ items: [{ ...item, evidence: "Jawaban" }] }, questions).items[0].evidence).toBe("Jawaban"));
  it("menerima perbedaan whitespace saja", () => {
    const q = [{ ...questions[0], answer: "Ini  jawaban\npanjang" }];
    expect(validateAiPayload({ items: [{ ...item, evidence: " Ini jawaban panjang " }] }, q).items).toHaveLength(1);
  });
});

describe("cacheKey", () => {
  const base = { submissionId: "s1", version: 1, questions, provider: "openai-compatible", model: "m1" };
  it("berbeda saat provider berbeda", () => expect(cacheKey(base)).not.toBe(cacheKey({ ...base, provider: "lain" })));
  it("berbeda saat model berbeda", () => expect(cacheKey(base)).not.toBe(cacheKey({ ...base, model: "m2" })));
  it("sama saat identik", () => expect(cacheKey(base)).toBe(cacheKey({ ...base })));
});
