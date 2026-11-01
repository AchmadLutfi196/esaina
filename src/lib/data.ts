import { prisma } from "@/lib/prisma";
import { safeJsonParse, countWords } from "@/lib/utils";
import type {
  Assessment,
  ClassItem,
  Question,
  QuestionAnswer,
  RubricCriterion,
  StudentSubmission,
} from "@/types";

// ─────────────────────────────────────────────────────────────
// Classes
// ─────────────────────────────────────────────────────────────

export async function getClassesForUser(userId: string, role: string) {
  const r = role.toLowerCase();
  const where =
    r === "student"
      ? { memberships: { some: { studentId: userId } } }
      : r === "admin"
        ? {}
        : { teacherId: userId };

  const classes = await prisma.class.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { memberships: true, assessments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return classes.map<ClassItem>((c) => ({
    id: c.id,
    name: c.name,
    subject: c.name.includes("—") ? c.name.split("—")[1]?.trim() : c.name,
    grade: "XII",
    academicYear: "2026/2027 Ganjil",
    classCode: c.joinCode,
    studentCount: c._count.memberships,
    assessmentCount: c._count.assessments,
    teacherName: c.teacher?.name ?? "Guru Pengampu",
  }));
}

export async function getClassById(classId: string, userId: string, role: string) {
  const r = role.toLowerCase();
  const cls = await prisma.class.findFirst({
    where: {
      id: classId,
      ...(r === "student"
        ? { memberships: { some: { studentId: userId } } }
        : r === "admin"
          ? {}
          : { teacherId: userId }),
    },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      memberships: {
        include: {
          student: { select: { id: true, name: true, identifier: true } },
        },
      },
      assessments: {
        orderBy: { createdAt: "desc" },
        include: {
          questions: { select: { id: true } },
          _count: { select: { submissions: true } },
        },
      },
    },
  });

  if (!cls) return null;

  return {
    id: cls.id,
    name: cls.name,
    subject: cls.name.includes("—") ? cls.name.split("—")[1]?.trim() : cls.name,
    grade: "XII",
    academicYear: "2026/2027 Ganjil",
    classCode: cls.joinCode,
    studentCount: cls.memberships.length,
    assessmentCount: cls.assessments.length,
    creatorName: cls.teacher.name,
    creator: { id: cls.teacher.id, name: cls.teacher.name, email: cls.teacher.email },
    students: cls.memberships.map((m) => ({
      id: m.student.id,
      name: m.student.name,
      nis: m.student.identifier ?? "—",
      joinedAt: m.joinedAt.toISOString(),
    })),
    assessments: cls.assessments.map((a) => ({
      id: a.id,
      title: a.title,
      code: a.id.slice(0, 8).toUpperCase(),
      status: a.status === "OPEN" ? "active" : a.status === "CLOSED" ? "completed" : "draft",
      dueDate: new Date().toISOString(),
      questionCount: a.questions.length,
      submissionCount: a._count.submissions,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// Assessments
// ─────────────────────────────────────────────────────────────

export const assessmentInclude = {
  class: { select: { name: true, teacher: { select: { name: true } } } },
  questions: {
    orderBy: { order: "asc" as const },
    include: { criteria: { orderBy: { order: "asc" as const } } },
  },
  submissions: {
    include: {
      student: { select: { id: true, name: true, identifier: true, anonCode: true } },
      answers: true,
      gradeRevisions: {
        orderBy: { version: "desc" as const },
        include: {
          author: { select: { name: true } },
          items: true,
          publications: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  publications: true,
};

type DbAssessment = Awaited<ReturnType<typeof prisma.assessment.findFirst<{ include: typeof assessmentInclude }>>>;

type Viewer = { id: string; role: string };

/**
 * PRD invariant (allowlist): siswa tidak boleh menerima jawaban acuan, rubrik
 * internal, maupun data siswa lain. Semua pemanggil wajib mengirim `viewer`
 * agar penyaringan dapat dilakukan sedini mungkin (sebelum serialisasi RSC).
 */
function toAssessment(a: NonNullable<DbAssessment>, viewer?: Viewer): Assessment {
  const isStudent = (viewer?.role ?? "").toLowerCase() === "student";

  const questions: Question[] = a.questions.map((q) => ({
    id: q.order,
    prompt: q.text,
    referenceAnswer: isStudent ? undefined : q.referenceAnswer,
    maxScore: q.maxScore,
    expectedKeywords: [],
    rubric: q.criteria.map<RubricCriterion>((c) => ({
      id: c.id,
      name: `${c.code} · ${c.description}`,
      weight: 1,
      maxScore: c.maxScore,
      description: c.description,
      levels: Array.isArray(c.levels) ? (c.levels as any) : [],
    })),
  }));

  const visibleSubmissions =
    isStudent && viewer ? a.submissions.filter((s) => s.student.id === viewer.id) : a.submissions;

  const submissions: StudentSubmission[] = visibleSubmissions.map((s) => {
    const answers: Record<number, QuestionAnswer> = {};
    const latestRev = s.gradeRevisions[0];

    for (const q of a.questions) {
      const match = s.answers.find((ans) => ans.questionId === q.id);
      const itemsForQ = latestRev?.items.filter((item) => item.questionId === q.id) ?? [];
      const scores: Record<string, number> = {};
      let qFeedback = "";

      for (const it of itemsForQ) {
        if (it.score !== null) scores[it.criterionId] = it.score;
        if (it.feedback) qFeedback = it.feedback;
      }

      answers[q.order] = {
        questionId: q.order,
        studentAnswer: match?.content ?? "",
        wordCount: countWords(match?.content ?? ""),
        lastUpdated: match?.savedAt.toISOString() ?? "",
        scores,
        teacherFeedback: qFeedback,
      };
    }

    const isSubmitted = s.status === "SUBMITTED";
    const statusGrading = latestRev?.status === "FINAL" ? "final" : latestRev ? "draft_graded" : "ungraded";
    // Siswa hanya melihat nilai setelah revisi diterbitkan (PRD FR15).
    const gradeVisible = !isStudent || Boolean(latestRev?.publications.length);

    return {
      id: s.id,
      studentId: s.student.id,
      studentName: s.student.name,
      studentNis: s.student.identifier ?? s.student.anonCode,
      submittedAt: s.submittedAt?.toISOString() ?? null,
      statusWork: isSubmitted ? "submitted" : "draft",
      statusGrading: gradeVisible ? statusGrading : "ungraded",
      raterName: gradeVisible ? (latestRev?.author.name ?? "Guru") : "",
      answers: gradeVisible
        ? answers
        : Object.fromEntries(
            Object.entries(answers).map(([k, v]) => [
              k,
              { ...v, scores: {}, teacherFeedback: "", aiSuggestion: undefined, isAiApplied: false },
            ])
          ),
      publishedScore: latestRev?.publications.length ? latestRev.totalScore : null,
      overallFinalScore: gradeVisible && latestRev?.status === "FINAL" ? latestRev.totalScore : null,
      teacherGeneralNotes: gradeVisible ? "" : "",
      gradeHistory: gradeVisible
        ? s.gradeRevisions.map((rev) => ({
            id: rev.id,
            timestamp: rev.createdAt.toISOString(),
            raterName: rev.author.name,
            action: rev.status === "FINAL" ? "finalized" : "score_adjustment",
            actionLabel: rev.status === "FINAL" ? "Nilai Difinalisasi" : "Draf Nilai Disimpan",
            newScore: rev.totalScore,
          }))
        : [],
    };
  });

  const isPublished = a.publications.length > 0;
  const status = a.status === "OPEN" ? "active" : a.status === "CLOSED" ? "completed" : "draft";

  return {
    id: a.id,
    classId: a.classId,
    className: a.class.name,
    teacherName: a.class.teacher?.name ?? "Guru Pengampu",
    title: a.title,
    code: a.id.slice(0, 8).toUpperCase(),
    subject: a.class.name.includes("—") ? a.class.name.split("—")[1]?.trim() : a.class.name,
    status,
    publicationStatus: isPublished ? "published" : "unpublished",
    publishedAt: a.publications[0]?.publishedAt.toISOString(),
    dueDate: a.closedAt?.toISOString() ?? new Date().toISOString(),
    durationMinutes: 60,
    raterCount: 1,
    targetRaters: 1,
    instructions: a.instruction,
    questions,
    submissions,
  };
}

export async function getAssessmentsForUser(userId: string, role: string) {
  const r = role.toLowerCase();
  const where =
    r === "student"
      ? { class: { memberships: { some: { studentId: userId } } } }
      : r === "admin"
        ? {}
        : { class: { teacherId: userId } };

  const rows = await prisma.assessment.findMany({
    where,
    include: assessmentInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => toAssessment(row as any, { id: userId, role }));
}

export async function getAssessmentsForClass(
  classId: string,
  userId: string,
  role: string
) {
  const r = role.toLowerCase();
  const rows = await prisma.assessment.findMany({
    where: {
      classId,
      ...(r === "student"
        ? { class: { memberships: { some: { studentId: userId } } }, status: { not: "DRAFT" } }
        : {}),
    },
    include: assessmentInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => toAssessment(row as any, { id: userId, role }));
}

export async function getAssessmentById(
  assessmentId: string,
  userId: string,
  role: string
) {
  const r = role.toLowerCase();
  const row = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      ...(r === "student"
        ? { class: { memberships: { some: { studentId: userId } } } }
        : r === "admin"
          ? {}
          : { class: { teacherId: userId } }),
    },
    include: assessmentInclude,
  });

  if (!row) return null;
  return toAssessment(row as any, { id: userId, role });
}

export async function getPendingGradingAssessments(userId: string) {
  const pending = await prisma.assessment.findMany({
    where: {
      class: { teacherId: userId },
      status: "OPEN",
    },
    include: {
      class: { select: { name: true } },
      _count: {
        select: {
          submissions: {
            where: { status: "SUBMITTED" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return pending;
}

export async function getTeacherStats(userId: string) {
  const [total, active, completed, submissions] = await Promise.all([
    prisma.assessment.count({ where: { class: { teacherId: userId } } }),
    prisma.assessment.count({ where: { class: { teacherId: userId }, status: "OPEN" } }),
    prisma.assessment.count({ where: { class: { teacherId: userId }, status: "CLOSED" } }),
    prisma.submission.count({
      where: {
        assessment: { class: { teacherId: userId } },
        status: "SUBMITTED",
      },
    }),
  ]);

  return {
    total,
    active,
    completed,
    pendingGrading: submissions,
    progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function getAdminStats() {
  const [teachers, students, activeAssessments, totalAssessments] =
    await Promise.all([
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.assessment.count({ where: { status: "OPEN" } }),
      prisma.assessment.count(),
    ]);

  return { teachers, students, activeAssessments, totalAssessments };
}
