-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "GradeStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateEnum
CREATE TYPE "GradeSource" AS ENUM ('MANUAL', 'AI');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('SUBMIT', 'APPLY_AI', 'CHANGE_GRADE', 'APPROVE', 'PUBLISH', 'DELETE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "anonCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMembership" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "referenceAnswer" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minScore" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "levels" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResult" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "sourceVersion" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "validationOk" BOOLEAN NOT NULL,
    "validationMsg" TEXT,
    "tokenUsed" INTEGER,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeRevision" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "approvedById" TEXT,
    "status" "GradeStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "GradeRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeItem" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" TEXT NOT NULL,
    "source" "GradeSource" NOT NULL DEFAULT 'MANUAL',
    "aiResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "publishedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "versionBefore" INTEGER,
    "versionAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_anonCode_key" ON "User"("anonCode");

-- CreateIndex
CREATE UNIQUE INDEX "Class_joinCode_key" ON "Class"("joinCode");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE INDEX "ClassMembership_studentId_idx" ON "ClassMembership"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMembership_classId_studentId_key" ON "ClassMembership"("classId", "studentId");

-- CreateIndex
CREATE INDEX "Assessment_classId_idx" ON "Assessment"("classId");

-- CreateIndex
CREATE INDEX "Question_assessmentId_idx" ON "Question"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_assessmentId_order_key" ON "Question"("assessmentId", "order");

-- CreateIndex
CREATE INDEX "RubricCriterion_questionId_idx" ON "RubricCriterion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricCriterion_questionId_code_key" ON "RubricCriterion"("questionId", "code");

-- CreateIndex
CREATE INDEX "Submission_studentId_idx" ON "Submission"("studentId");

-- CreateIndex
CREATE INDEX "Submission_assessmentId_status_idx" ON "Submission"("assessmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_assessmentId_studentId_key" ON "Submission"("assessmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_submissionId_questionId_key" ON "Answer"("submissionId", "questionId");

-- CreateIndex
CREATE INDEX "AIResult_submissionId_cacheKey_idx" ON "AIResult"("submissionId", "cacheKey");

-- CreateIndex
CREATE INDEX "AIResult_submissionId_createdAt_idx" ON "AIResult"("submissionId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "GradeRevision_submissionId_status_idx" ON "GradeRevision"("submissionId", "status");

-- CreateIndex
CREATE INDEX "GradeRevision_submissionId_version_idx" ON "GradeRevision"("submissionId", "version");

-- CreateIndex
CREATE INDEX "GradeItem_criterionId_idx" ON "GradeItem"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeItem_revisionId_questionId_criterionId_key" ON "GradeItem"("revisionId", "questionId", "criterionId");

-- CreateIndex
CREATE INDEX "Publication_assessmentId_idx" ON "Publication"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_revisionId_key" ON "Publication"("revisionId");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_userId_scope_idx" ON "IdempotencyKey"("userId", "scope");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResult" ADD CONSTRAINT "AIResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResult" ADD CONSTRAINT "AIResult_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeRevision" ADD CONSTRAINT "GradeRevision_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeRevision" ADD CONSTRAINT "GradeRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeRevision" ADD CONSTRAINT "GradeRevision_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeItem" ADD CONSTRAINT "GradeItem_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "GradeRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeItem" ADD CONSTRAINT "GradeItem_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeItem" ADD CONSTRAINT "GradeItem_aiResultId_fkey" FOREIGN KEY ("aiResultId") REFERENCES "AIResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "GradeRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
