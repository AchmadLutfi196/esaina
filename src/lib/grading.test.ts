import { describe, expect, it } from "vitest";

function validScores(items: { score: number | null; min: number; max: number }[]) {
  return items.every((x) => x.score === null || (x.score >= x.min && x.score <= x.max));
}

describe("manual grading invariants", () => {
  it("menolak skor di luar rentang rubrik", () => {
    expect(validScores([{ score: 3, min: 0, max: 2 }])).toBe(false);
  });
  it("mempertahankan nilai kosong sebagai null", () => {
    expect(validScores([{ score: null, min: 0, max: 2 }])).toBe(true);
  });
  it("total hanya menjumlah skor terisi", () => {
    expect([2, null, 1].reduce<number>((sum, score) => sum + (score ?? 0), 0)).toBe(3);
  });
});
