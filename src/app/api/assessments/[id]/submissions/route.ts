import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTeacher, route } from "@/lib/auth/guard";
import { notFound } from "@/lib/api-error";
import { ok } from "@/lib/http";

 type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (req, ctx: Ctx) => {
  const teacher = await requireTeacher();
  const { id } = await ctx.params;
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { id: true, title: true, class: { select: { teacherId: true } } },
  });
  if (!assessment) throw notFound("Asesmen");
  if (assessment.class.teacherId !== teacher.id) throw notFound("Asesmen");

  const params = new URL(req.url).searchParams;
  const status = z.enum(["ALL", "SUBMITTED", "GRADED"]).catch("ALL").parse(params.get("status") ?? "ALL");
  const search = (params.get("search") ?? "").trim();
  const submissions = await prisma.submission.findMany({
    where: {
      assessmentId: id,
      status: "SUBMITTED",
      ...(search ? { student: { anonCode: { contains: search, mode: "insensitive" } } } : {}),
    },
    orderBy: { submittedAt: "asc" },
    select: {
      id: true, status: true, submittedAt: true,
      student: { select: { anonCode: true } },
      gradeRevisions: { where: { status: { in: ["DRAFT", "FINAL"] } }, orderBy: { version: "desc" }, take: 1, select: { status: true, totalScore: true } },
    },
  });

  const rows = submissions.map((s) => ({
    id: s.id,
    anonCode: s.student.anonCode,
    status: s.gradeRevisions[0]?.status ? "GRADED" : "UNGRADED",
    totalScore: s.gradeRevisions[0]?.totalScore ?? null,
    submittedAt: s.submittedAt,
  })).filter((s) => status === "ALL" || (status === "SUBMITTED" && s.status === "UNGRADED") || (status === "GRADED" && s.status === "GRADED"));
  return ok({ assessment: { id: assessment.id, title: assessment.title }, submissions: rows });
});
