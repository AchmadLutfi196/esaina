export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const unauthorized = () => new ApiError(401, "unauthorized", "Sesi tidak ditemukan atau kedaluwarsa.");
export const forbidden = () => new ApiError(403, "forbidden", "Anda tidak memiliki akses ke data ini.");
export const notFound = (what = "Data") => new ApiError(404, "not_found", `${what} tidak ditemukan.`);
export const conflict = (message: string) =>
  new ApiError(409, "version_conflict", message);
export const validationError = (details: unknown) =>
  new ApiError(422, "validation_error", "Data tidak valid.", details);
