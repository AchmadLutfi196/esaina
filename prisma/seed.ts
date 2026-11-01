import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "demo1234";

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const guru = await prisma.user.upsert({
    where: { email: "guru@demo.sch.id" },
    update: {},
    create: { email: "guru@demo.sch.id", name: "Bu Dewi", passwordHash: hash, role: "TEACHER", anonCode: "T-DEMO", identifier: "NIP-001" },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.sch.id" },
    update: {},
    create: { email: "admin@demo.sch.id", name: "Admin Sekolah", passwordHash: hash, role: "ADMIN", anonCode: "A-DEMO", identifier: "NIP-ADM" },
  });

  const students = await Promise.all(
    [1, 2, 3, 4].map(async (n) => {
      const code = `S00${n}`;
      return prisma.user.upsert({
        where: { email: `${code.toLowerCase()}@demo.sch.id` },
        update: {},
        create: { email: `${code.toLowerCase()}@demo.sch.id`, name: `Siswa ${code}`, passwordHash: hash, role: "STUDENT", anonCode: code, identifier: `NIS-${code}` },
      });
    })
  );

  const kelas = await prisma.class.upsert({
    where: { joinCode: "XIIA01" },
    update: {},
    create: { name: "XII A", joinCode: "XIIA01", teacherId: guru.id },
  });

  await Promise.all(
    students.map((s) =>
      prisma.classMembership.upsert({
        where: { classId_studentId: { classId: kelas.id, studentId: s.id } },
        update: {},
        create: { classId: kelas.id, studentId: s.id },
      })
    )
  );

  const uts = await prisma.assessment.upsert({
    where: { id: "seed-uts-ipa" },
    update: {},
    create: {
      id: "seed-uts-ipa",
      classId: kelas.id,
      title: "UTS IPA — Fotosintesis",
      instruction:
        "Jawab kedua soal berikut dengan bahasa sendiri. Tuliskan proses, pihak yang terlibat, dan hasilnya.",
      status: "OPEN",
      openedAt: new Date(),
    },
  });

  const q1 = await prisma.question.upsert({
    where: { assessmentId_order: { assessmentId: uts.id, order: 1 } },
    update: {},
    create: {
      assessmentId: uts.id,
      order: 1,
      text: "Jelaskan proses fotosintesis dan sebutkan hasilnya.",
      referenceAnswer:
        "Fotosintesis adalah proses pembuatan makanan pada tumbuhan dengan bantuan cahaya matahari, air, dan karbon dioksida menjadi glukosa dan oksigen.",
      maxScore: 6,
    },
  });

  await prisma.question.upsert({
    where: { assessmentId_order: { assessmentId: uts.id, order: 2 } },
    update: {},
    create: {
      assessmentId: uts.id,
      order: 2,
      text: "Mengapa fotosintesis penting bagi kehidupan manusia?",
      referenceAnswer:
        "Fotosintesis menghasilkan oksigen untuk bernapas dan glukosa sebagai sumber energi bagi rantai makanan.",
      maxScore: 4,
    },
  });

  const criteria = [
    { code: "C1", description: "Menyebutkan definisi/proses fotosintesis", minScore: 0, maxScore: 2 },
    { code: "C2", description: "Menjelaskan perubahan energi (cahaya → kimia)", minScore: 0, maxScore: 2 },
    { code: "C3", description: "Menyebutkan hasil (glukosa dan oksigen)", minScore: 0, maxScore: 2 },
  ];

  await Promise.all(
    criteria.map((c, i) =>
      prisma.rubricCriterion.upsert({
        where: { questionId_code: { questionId: q1.id, code: c.code } },
        update: {},
        create: { ...c, questionId: q1.id, order: i + 1, levels: { 0: "tidak ada", 1: "parsial", 2: "lengkap" } },
      })
    )
  );

  // Dua LJK terkumpul: S001 (lengkap), S002 (ada jawaban kosong)
  const subs: Array<{ student: (typeof students)[number]; answers: [number, string][] }> = [
    {
      student: students[0],
      answers: [
        [
          1,
          "Fotosintesis adalah proses tumbuhan membuat makanan dengan bantuan cahaya matahari. Energi cahaya diubah menjadi energi kimia yang disimpan sebagai glukosa, dan oksigen dilepaskan.",
        ],
        [2, "Penting karena menghasilkan oksigen untuk bernapas."],
      ],
    },
    {
      student: students[1],
      answers: [
        [1, "Tumbuhan membuat makanan dengan cahaya matahari."],
        [2, ""],
      ],
    },
  ];

  for (const { student, answers } of subs) {
    const sub = await prisma.submission.upsert({
      where: { assessmentId_studentId: { assessmentId: uts.id, studentId: student.id } },
      update: { status: "SUBMITTED", submittedAt: new Date() },
      create: { assessmentId: uts.id, studentId: student.id, status: "SUBMITTED", submittedAt: new Date() },
    });
    for (const [order, content] of answers) {
      const q = await prisma.question.findUnique({ where: { assessmentId_order: { assessmentId: uts.id, order } } });
      if (!q) continue;
      await prisma.answer.upsert({
        where: { submissionId_questionId: { submissionId: sub.id, questionId: q.id } },
        update: { content },
        create: { submissionId: sub.id, questionId: q.id, content },
      });
    }
  }

  console.log("Seed selesai: guru@demo.sch.id, siswa s001..s004@demo.sch.id, pw:", DEMO_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
