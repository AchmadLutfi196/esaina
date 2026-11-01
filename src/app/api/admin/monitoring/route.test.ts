import { describe, expect, it } from "vitest";
import { progressOf } from "./route";

describe("progressOf", () => {
  it("null saat belum ada LJK (bukan 0%)", () => {
    expect(progressOf(0, 0)).toBeNull();
  });
  it("bulat ke persen terdekat", () => {
    expect(progressOf(1, 3)).toBe(33);
    expect(progressOf(2, 3)).toBe(67);
  });
  it("100 saat semua disahkan", () => {
    expect(progressOf(5, 5)).toBe(100);
  });
});
