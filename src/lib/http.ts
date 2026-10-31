import { validationError } from "@/lib/api-error";

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw validationError({ body: "Body harus JSON yang valid." });
  }
}

export function ok(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

/** Params dinamis Next 16: Promise. */
export async function readParams<T extends Record<string, string>>(params: Promise<T>): Promise<T> {
  return params;
}
