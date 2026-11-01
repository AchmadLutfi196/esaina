import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "demo1234";

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Guru Demo & Siswa Demo (Sesuai PRD)
  const guru = await prisma.user.upsert({
    where: { email: "guru@demo.sch.id" },
    update: { passwordHash: hash, name: "Bu Dewi", role: "TEACHER" },
    create: {
      email: "guru@demo.sch.id",
      name: "Bu Dewi",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-DEMO",
      identifier: "198005122008012001",
    },
  });

  // Guru tambahan untuk login demo
  const teacher1 = await prisma.user.upsert({
    where: { email: "teacher1@example.com" },
    update: { passwordHash: hash, name: "Dra. Sri Wahyuni, M.Pd.", role: "TEACHER" },
    create: {
      email: "teacher1@example.com",
      name: "Dra. Sri Wahyuni, M.Pd.",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-SRI",
      identifier: "197501012005011001",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "teacher2@example.com" },
    update: { passwordHash: hash, name: "Budi Santoso, S.Pd.", role: "TEACHER" },
    create: {
      email: "teacher2@example.com",
      name: "Budi Santoso, S.Pd.",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-BUDI",
      identifier: "198203152008011002",
    },
  });

  // Admin demo
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: hash, name: "Administrator Sekolah", role: "ADMIN" },
    create: {
      email: "admin@example.com",
      name: "Administrator Sekolah",
      passwordHash: hash,
      role: "ADMIN",
      anonCode: "ADM-01",
      identifier: "197001011995031001",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.sch.id" },
    update: { passwordHash: hash, name: "Administrator Sekolah", role: "ADMIN" },
    create: {
      email: "admin@demo.sch.id",
      name: "Administrator Sekolah",
      passwordHash: hash,
      role: "ADMIN",
      anonCode: "ADM-DEMO",
      identifier: "197001011995031002",
    },
  });

  // Siswa demo (termasuk student1@example.com untuk tombol demo di login UI)
  const student1Ui = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: { passwordHash: hash, name: "Aisyah Putri Rahmadani", role: "STUDENT" },
    create: {
      email: "student1@example.com",
      name: "Aisyah Putri Rahmadani",
      passwordHash: hash,
      role: "STUDENT",
      anonCode: "S000",
      identifier: "20261000",
    },
  });

  const students = await Promise.all(
    [1, 2, 3, 4].map(async (n) => {
      const code = `S00${n}`;
      return prisma.user.upsert({
        where: { email: `${code.toLowerCase()}@demo.sch.id` },
        update: { passwordHash: hash },
        create: {
          email: `${code.toLowerCase()}@demo.sch.id`,
          name: `Siswa ${code}`,
          passwordHash: hash,
          role: "STUDENT",
          anonCode: code,
          identifier: `2026100${n}`,
        },
      });
    })
  );
  const allStudents = [student1Ui, ...students];

  const kelas = await prisma.class.upsert({
    where: { joinCode: "XIIA01" },
    update: { teacherId: teacher1.id },
    create: { name: "XII A — Biologi & Sains", joinCode: "XIIA01", teacherId: teacher1.id },
  });

  await prisma.class.upsert({
    where: { joinCode: "XIIB01" },
    update: { teacherId: guru.id },
    create: { name: "XII B — Biologi & Kimia Terapan", joinCode: "XIIB01", teacherId: guru.id },
  });

  await prisma.class.upsert({
    where: { joinCode: "XIMIPA" },
    update: { teacherId: teacher2.id },
    create: { name: "XI MIPA — Fisika Terapan", joinCode: "XIMIPA", teacherId: teacher2.id },
  });

  await Promise.all(
    allStudents.map((s) =>
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
      title: "Penilaian Tengah Semester: Fisiologi Sel & Fotosintesis",
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
      text: "Jelaskan proses fotolisis air dan aliran elektron pada reaksi terang fotosintesis serta sebutkan produk akhirnya!",
      referenceAnswer:
        "Fotosintesis adalah proses konversi energi cahaya matahari menjadi energi kimia. Pada reaksi terang di tilakoid, fotolisis air memecah H2O menjadi elektron, proton H+, dan gas oksigen O2. Elektron ditranspor melalui fotosistem II dan I menghasilkan NADPH dan ATP.",
      maxScore: 6,
    },
  });

  await prisma.question.upsert({
    where: { assessmentId_order: { assessmentId: uts.id, order: 2 } },
    update: {},
    create: {
      assessmentId: uts.id,
      order: 2,
      text: "Mengapa fiksasi karbon pada tanaman tipe CAM terjadi pada malam hari, dan apa keunggulannya?",
      referenceAnswer:
        "Tanaman CAM membuka stomata pada malam hari untuk meminimalkan kehilangan air akibat transpirasi di lingkungan xerofit/gurun. CO2 difiksasi oleh enzim PEP karboksilase menjadi asam malat dan disimpan di vakuola.",
      maxScore: 4,
    },
  });

  const criteria = [
    { code: "C1", description: "Menyebutkan definisi dan tahapan reaksi fotosintesis", minScore: 0, maxScore: 2 },
    { code: "C2", description: "Menjelaskan perubahan energi (cahaya → ATP/NADPH)", minScore: 0, maxScore: 2 },
    { code: "C3", description: "Menyebutkan produk akhir (glukosa dan oksigen)", minScore: 0, maxScore: 2 },
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
          "Fotosintesis adalah proses tumbuhan memproduksi glukosa dan oksigen dari CO2 dan air menggunakan energi cahaya. Pada tilakoid terjadi fotolisis air dan aliran elektron yang menghasilkan ATP dan NADPH.",
        ],
        [2, "Tanaman CAM membuka stomata pada malam hari agar tidak kehilangan air karena udara malam lebih lembab dan sejuk."],
      ],
    },
    {
      student: students[1],
      answers: [
        [1, "Tumbuhan membuat makanan dengan bantuan sinar matahari dan klorofil."],
        [2, "Untuk menghemat air saat siang hari."],
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

  console.log("✅ Seed selesai!");
  console.log("• Akun Guru : guru@demo.sch.id / teacher1@example.com (Password: demo1234)");
  console.log("• Akun Siswa: s001@demo.sch.id s/d s004@demo.sch.id (Password: demo1234)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
