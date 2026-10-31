import { prisma } from "@/lib/prisma";
import { safeJsonParse, countWords } from "@/lib/utils";
import type {
  AiExplanation,
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
  const where =
    role === "student"
      ? { enrollments: { some: { studentId: userId } } }
      : role === "admin"
        ? {}
        : { creatorId: userId };

  const classes = await prisma.class.findMany({
    where,
    include: {
      _count: { select: { enrollments: true, assessments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return classes.map<ClassItem>((c) => ({
    id: c.id,
    name: c.name,
    subject: c.subject,
    grade: c.grade,
    academicYear: c.academicYear,
    classCode: c.classCode,
    studentCount: c._count.enrollments,
    assessmentCount: c._count.assessments,
  }));
}

export async function getClassById(classId: string, userId: string, role: string) {
  const cls = await prisma.class.findFirst({
    where: {
      id: classId,
      ...(role === "student"
        ? { enrollments: { some: { studentId: userId } } }
        : role === "admin"
          ? {}
          : { creatorId: userId }),
    },
    include: {
      _count: { select: { enrollments: true, assessments: true } },
      creator: { select: { name: true } },
    },
  });

  if (!cls) return null;

  return {
    id: cls.id,
    name: cls.name,
    subject: cls.subject,
    grade: cls.grade,
    academicYear: cls.academicYear,
    classCode: cls.classCode,
    studentCount: cls._count.enrollments,
    assessmentCount: cls._count.assessments,
    creatorName: cls.creator.name,
  };
}

// ─────────────────────────────────────────────────────────────
// Assessments
// ─────────────────────────────────────────────────────────────

interface RawAssessment {
  id: string;
  classId: string;
  title: string;
  code: string;
  subject: string;
  status: string;
  publicationStatus: string;
  publishedAt: Date | null;
  dueDate: Date;
  durationMinutes: number;
  raterCount: number;
  targetRaters: number;
  instructions: string;
  class: { name: string };
  questions: Array<{
    id: string;
    orderNumber: number;
    prompt: string;
    referenceAnswer: string;
    maxScore: number;
    expectedKeywords: string;
    rubric: Array<{
      id: string;
      name: string;
      weight: number;
      maxScore: number;
      description: string;
      levels: string;
    }>;
  }>;
  submissions: Array<{
    id: string;
    studentId: string;
    statusWork: string;
    statusGrading: string;
    submittedAt: Date | null;
    overallFinalScore: number | null;
    publishedScore: number | null;
    teacherGeneralNotes: string;
    student: { id: string; name: string; identifier: string | null };
    answers: Array<{
      id: string;
      questionId: string;
      studentAnswer: string;
      wordCount: number;
      charCount: number;
      teacherFeedback: string;
      finalScore: number | null;
      indobertScore: number | null;
      aiExplanation: string | null;
      isAiApplied: boolean;
      status: string;
      ratings: Array<{ score: number; rater: { name: string } }>;
      criterionScores?: Array<{ criterionId: string; score: number }>;
    }>;
    gradeHistories: Array<{
      id: string;
      action: string;
      actionLabel: string;
      note: string;
      createdAt: Date;
      previousScore: number | null;
      newScore: number | null;
      questionId: string | null;
      rater: { name: string } | null;
    }>;
  }>;
}

export const assessmentInclude = {
  class: { select: { name: true } },
  questions: {
    orderBy: { orderNumber: "asc" as const },
    include: { rubric: { orderBy: { name: "asc" as const } } },
  },
  submissions: {
    include: {
      student: { select: { id: true, name: true, identifier: true } },
      answers: {
        include: {
          ratings: { include: { rater: { select: { name: true } } } },
          criterionScores: { select: { criterionId: true, score: true } },
        },
      },
      gradeHistories: {
        orderBy: { createdAt: "desc" as const },
        include: { rater: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

function toQuestion(q: RawAssessment["questions"][number]): Question {
  return {
    id: q.orderNumber,
    prompt: q.prompt,
    referenceAnswer: q.referenceAnswer,
    maxScore: q.maxScore,
    expectedKeywords: safeJsonParse<string[]>(q.expectedKeywords, []),
    rubric: q.rubric.map<RubricCriterion>((r) => ({
      id: r.id,
      name: r.name,
      weight: r.weight,
      maxScore: r.maxScore,
      description: r.description,
      levels: safeJsonParse(r.levels, []),
    })),
  };
}

function toSubmission(
  s: RawAssessment["submissions"][number],
  questions: RawAssessment["questions"]
): StudentSubmission {
  const answers: Record<number, QuestionAnswer> = {};

  for (const q of questions) {
    const match = s.answers.find((a) => a.questionId === q.id);
    if (!match) {
      answers[q.orderNumber] = {
        questionId: q.orderNumber,
        studentAnswer: "",
        wordCount: 0,
        lastUpdated: "",
        scores: {},
        teacherFeedback: "",
      };
      continue;
    }

    // Map DB saved criterion scores or calculate from holistic rating
    const scores: Record<string, number> = {};
    if (match.criterionScores && match.criterionScores.length > 0) {
      for (const cs of match.criterionScores) {
        scores[cs.criterionId] = cs.score;
      }
    } else {
      const holistic = match.ratings[0]?.score ?? 0;
      if (q.rubric.length > 0) {
        const rubricTotal = q.rubric.reduce((sum, r) => sum + r.maxScore, 0);
        let allocated = 0;
        q.rubric.forEach((r, idx) => {
          const isLast = idx === q.rubric.length - 1;
          const value = isLast
            ? Math.max(0, holistic - allocated)
            : Math.round((r.maxScore / rubricTotal) * holistic);
          scores[r.id] = value;
          allocated += value;
        });
      }
    }

    answers[q.orderNumber] = {
      questionId: q.orderNumber,
      studentAnswer: match.studentAnswer,
      wordCount: match.wordCount || countWords(match.studentAnswer),
      lastUpdated: "",
      scores,
      teacherFeedback: match.teacherFeedback,
      aiSuggestion: safeJsonParse<AiExplanation | undefined>(match.aiExplanation, undefined),
      isAiApplied: match.isAiApplied ?? false,
    };
  }

  return {
    id: s.id,
    studentId: s.student.id,
    studentName: s.student.name,
    studentNis: s.student.identifier ?? "—",
    submittedAt: s.submittedAt?.toISOString() ?? null,
    statusWork: s.statusWork as StudentSubmission["statusWork"],
    statusGrading: s.statusGrading as StudentSubmission["statusGrading"],
    raterName: s.answers[0]?.ratings[0]?.rater.name ?? "Guru",
    answers,
    publishedScore: s.publishedScore,
    overallFinalScore: s.overallFinalScore,
    teacherGeneralNotes: s.teacherGeneralNotes,
    gradeHistory: s.gradeHistories.map((g) => ({
      id: g.id,
      timestamp: g.createdAt.toISOString(),
      raterName: g.rater?.name ?? "Sistem",
      action: g.action as never,
      actionLabel: g.actionLabel,
      note: g.note,
      previousScore: g.previousScore ?? undefined,
      newScore: g.newScore ?? undefined,
      questionId: undefined,
    })),
  };
}

function toAssessment(a: RawAssessment): Assessment {
  const questions = a.questions.map(toQuestion);
  return {
    id: a.id,
    classId: a.classId,
    className: a.class.name,
    title: a.title,
    code: a.code,
    subject: a.subject,
    status: a.status as Assessment["status"],
    publicationStatus: a.publicationStatus as Assessment["publicationStatus"],
    publishedAt: a.publishedAt?.toISOString(),
    dueDate: a.dueDate.toISOString(),
    durationMinutes: a.durationMinutes,
    raterCount: a.raterCount,
    targetRaters: a.targetRaters,
    instructions: a.instructions,
    questions,
    submissions: a.submissions.map((s) => toSubmission(s, a.questions)),
  };
}

export async function getAssessmentsForUser(userId: string, role: string) {
  const where =
    role === "student"
      ? { class: { enrollments: { some: { studentId: userId } } } }
      : role === "admin"
        ? {}
        : {
            OR: [
              { creatorId: userId },
              { raters: { some: { raterId: userId } } },
            ],
          };

  const rows = await prisma.assessment.findMany({
    where,
    include: assessmentInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => toAssessment(r as unknown as RawAssessment));
}

export async function getAssessmentsForClass(
  classId: string,
  userId: string,
  role: string
) {
  const rows = await prisma.assessment.findMany({
    where: {
      classId,
      ...(role === "student"
        ? { class: { enrollments: { some: { studentId: userId } } }, status: { not: "draft" } }
        : {}),
    },
    include: assessmentInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => toAssessment(r as unknown as RawAssessment));
}

export async function getAssessmentById(
  assessmentId: string,
  userId: string,
  role: string
) {
  const row = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      ...(role === "student"
        ? { class: { enrollments: { some: { studentId: userId } } } }
        : role === "admin"
          ? {}
          : {
              OR: [
                { creatorId: userId },
                { raters: { some: { raterId: userId } } },
              ],
            }),
    },
    include: assessmentInclude,
  });

  if (!row) return null;
  return toAssessment(row as unknown as RawAssessment);
}

/** Assessments this teacher is assigned to rate but did not create. */
export async function getRaterAssignments(userId: string) {
  return prisma.assessment.findMany({
    where: {
      raters: { some: { raterId: userId } },
      creatorId: { not: userId },
    },
    include: {
      class: { select: { name: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueDate: "asc" },
  });
}

// ─────────────────────────────────────────────────────────────
// Dashboard statistics
// ─────────────────────────────────────────────────────────────

export async function getTeacherStats(userId: string) {
  const [total, active, completed, submissions] = await Promise.all([
    prisma.assessment.count({ where: { creatorId: userId } }),
    prisma.assessment.count({ where: { creatorId: userId, status: "active" } }),
    prisma.assessment.count({ where: { creatorId: userId, status: "completed" } }),
    prisma.submission.count({
      where: {
        assessment: { creatorId: userId },
        statusWork: "submitted",
        statusGrading: { not: "final" },
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
      prisma.user.count({ where: { role: "teacher" } }),
      prisma.user.count({ where: { role: "student" } }),
      prisma.assessment.count({ where: { status: "active" } }),
      prisma.assessment.count(),
    ]);

  return { teachers, students, activeAssessments, totalAssessments };
}
