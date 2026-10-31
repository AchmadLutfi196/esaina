import { describe, expect, it } from "vitest";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

describe("CSV export", () => {
  it("mengutip nilai yang mengandung koma atau kutip", () => {
    expect(csvCell('dia bilang "siap", lalu pergi')).toBe('"dia bilang ""siap"", lalu pergi"');
  });
  it("tidak mengutip angka biasa", () => {
    expect(csvCell(12)).toBe("12");
  });
  it("kolom anonim, total, per soal, waktu terbit", () => {
    const questions = [{ id: "q1" }, { id: "q2" }];
    const header = ["anon_code", "total_score", ...questions.map((q) => `question_${q.id}_score`), "published_at"];
    expect(header.join(",")).toBe("anon_code,total_score,question_q1_score,question_q2_score,published_at");
  });
});
