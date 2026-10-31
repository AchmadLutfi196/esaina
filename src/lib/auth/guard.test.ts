import { describe, expect, it, vi, beforeEach } from "vitest";

const getServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => getServerSession(...a) }));
vi.mock("@/lib/auth/config", () => ({ authOptions: {} }));

const classFindUnique = vi.fn();
const membershipFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    class: { findUnique: (...a: unknown[]) => classFindUnique(...a) },
    classMembership: { findUnique: (...a: unknown[]) => membershipFindUnique(...a) },
  },
}));

const { requireTeacher, requireStudent, requireClassOwner, requireClassMember, errorResponse } =
  await import("./guard");
const { ApiError } = await import("@/lib/api-error");

const TEACHER = { id: "u1", name: "Guru", email: "t@x.id", role: "TEACHER" as const };
const STUDENT = { id: "u2", name: "Siswa", email: "s@x.id", role: "STUDENT" as const };

beforeEach(() => {
  getServerSession.mockReset();
  classFindUnique.mockReset();
  membershipFindUnique.mockReset();
});

describe("requireTeacher / requireStudent", () => {
  it("menolak tanpa sesi dengan 401", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(requireTeacher()).rejects.toMatchObject({ status: 401 });
  });

  it("menolak siswa pada requireTeacher dengan 403", async () => {
    getServerSession.mockResolvedValue({ user: STUDENT });
    await expect(requireTeacher()).rejects.toMatchObject({ status: 403 });
  });

  it("mengizinkan guru pada requireTeacher", async () => {
    getServerSession.mockResolvedValue({ user: TEACHER });
    await expect(requireTeacher()).resolves.toEqual(TEACHER);
  });
});

describe("requireClassOwner", () => {
  it("menolak guru lain dengan 403", async () => {
    classFindUnique.mockResolvedValue({ id: "c1", teacherId: "other" });
    await expect(requireClassOwner("c1", TEACHER)).rejects.toMatchObject({ status: 403 });
  });

  it("memperbolehkan pemilik", async () => {
    classFindUnique.mockResolvedValue({ id: "c1", teacherId: TEACHER.id });
    await expect(requireClassOwner("c1", TEACHER)).resolves.toMatchObject({ id: "c1" });
  });
});

describe("requireClassMember", () => {
  it("menolak non-anggota dengan 403", async () => {
    membershipFindUnique.mockResolvedValue(null);
    await expect(requireClassMember("c1", STUDENT)).rejects.toMatchObject({ status: 403 });
  });
});

describe("errorResponse", () => {
  it("memetakan 422 dengan details", async () => {
    const res = errorResponse(new ApiError(422, "validation_error", "x", { field: "email" }));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: "validation_error", details: { field: "email" } });
  });

  it("menyamarkan error tak dikenal sebagai 500", async () => {
    const res = errorResponse(new Error("boom"));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: "internal_error" });
  });
});
