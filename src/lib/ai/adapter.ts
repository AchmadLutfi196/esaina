export type LlmCriterion = {
  id: string;
  code: string;
  description: string;
  minScore: number;
  maxScore: number;
};

export type LlmQuestion = {
  id: string;
  text: string;
  referenceAnswer: string;
  answer: string;
  criteria: LlmCriterion[];
};

export type AiGradeItem = {
  questionId: string;
  criterionId: string;
  score: number;
  evidence: string;
  rationale: string;
  feedback: string;
};

export type AiGradePayload = {
  items: AiGradeItem[];
};

export type LlmAdapter = {
  provider: string;
  model: string;
  complete(input: { system: string; user: string }): Promise<string>;
};

export function createLlmAdapter(): LlmAdapter {
  const baseUrl = (process.env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;
  if (!apiKey || !model) throw new Error("LLM belum dikonfigurasi.");

  return {
    provider: process.env.LLM_PROVIDER ?? "openai-compatible",
    model,
    async complete(input) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: input.system },
            { role: "user", content: input.user },
          ],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`LLM HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }
      const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const content = body.choices?.[0]?.message?.content;
      if (!content) throw new Error("Respons LLM kosong.");
      return content;
    },
  };
}
