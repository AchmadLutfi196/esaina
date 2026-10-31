import { describe, expect, it } from "vitest";
import { generateJoinCode, uniqueJoinCode } from "./join-code";

describe("join code", () => {
  it("menghasilkan kode 6 karakter tanpa karakter ambigu", () => {
    const code = generateJoinCode();
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
    expect(code).not.toMatch(/[01ILO]/);
  });

  it("retry sampai kode unik", async () => {
    const seen = new Set(["first"]);
    let calls = 0;
    const code = await uniqueJoinCode(async (candidate) => {
      calls++;
      return calls === 1;
    });
    expect(code).toHaveLength(6);
    expect(seen.has(code)).toBe(false);
  });
});
