import { afterEach, expect, it, vi } from "vitest";
import { createLlmAdapter } from "./adapter";

afterEach(() => vi.unstubAllGlobals());

it("mengulang tanpa response_format setelah 400 lalu parse JSON", async () => {
  process.env.LLM_API_KEY = "k";
  process.env.LLM_MODEL = "m";
  const bodies: string[] = [];
  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    bodies.push(String(init.body));
    if (bodies.length === 1) return new Response("no", { status: 400 });
    return Response.json({ choices: [{ message: { content: '```json\n{"items":[]}\n```' } }] });
  });
  vi.stubGlobal("fetch", fetchMock);

  const out = await createLlmAdapter().complete({ system: "s", user: "u" });

  expect(bodies[0]).toContain("response_format");
  expect(bodies[1]).not.toContain("response_format");
  expect(JSON.parse(out)).toEqual({ items: [] });
});
