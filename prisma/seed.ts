import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

/** Deterministic pseudo-score so seeded data stays reproducible. */
function pseudoScore(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return Math.round((hash % (max + 1)) * 10) / 10;
}

const ESSAY_ANSWER_STRONG = `Fotosintesis berlangsung di dalam kloroplas, tepatnya pada membran tilakoid dan stroma. Pigmen klorofil menangkap foton cahaya matahari, lalu energi tersebut dipakai untuk memecah molekul air melalui fotolisis, menghasilkan oksigen sebagai produk sampingan.

Energi cahaya yang ditangkap tidak hilang, melainkan diubah menjadi energi kimia yang tersimpan dalam ikatan kovalen molekul glukosa. Glukosa inilah yang kemudian menjadi sumber energi bagi tanaman ketika dipecah kembali melalui respirasi seluler.`;

const ESSAY_ANSWER_MEDIUM = `Fotosintesis terjadi pada kloroplas yang mengandung klorofil. Cahaya matahari diserap oleh klorofil kemudian digunakan untuk mengubah air dan karbon dioksida menjadi glukosa. Energi cahaya berubah menjadi energi kimia yang tersimpan di dalam glukosa tersebut.`;

const ESSAY_ANSWER_WEAK = `Fotosintesis adalah proses tumbuhan membuat makanan dengan bantuan cahaya matahari. Daun berwarna hijau karena klorofil. Prosesnya menghasilkan glukosa dan oksigen.`;

async function main() {
  console.log("🌱 Seeding ESAINA database…");

  // ── Clean ───────────────────────────────────────────────────
  await prisma.gradeHistory.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.rubricCriterion.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessmentRater.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password", 10);

  // ── Users ───────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Administrator Sekolah",
      email: "admin@example.com",
      password,
      role: "admin",
      identifier: null,
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      name: "Dra. Sri Wahyuni, M.Pd.",
      email: "teacher1@example.com",
      password,
      role: "teacher",
      identifier: "197501012005011001",
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Budi Santoso, S.Pd.",
      email: "teacher2@example.com",
      password,
      role: "teacher",
      identifier: "198203152008011002",
    },
  });

  const teacher3 = await prisma.user.create({
    data: {
      name: "Nurul Hidayah, S.Pd.",
      email: "teacher3@example.com",
      password,
      role: "teacher",
      identifier: "198712202010012003",
    },
  });

  const studentNames = [
    "Aisyah Putri Rahmadani",
    "Bagas Wicaksono",
    "Citra Dewi Lestari",
    "Dimas Arya Pratama",
    "Eka Nur Fadilah",
    "Fajar Ramadhan",
    "Gita Ayu Safitri",
    "Hafiz Firmansyah",
    "Indah Permata Sari",
    "Joko Susilo",
    "Kirana Maharani",
    "Lukman Hakim",
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const nis = `2024${String(1101 + i).padStart(4, "0")}`;
    const student = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: i === 0 ? "student1@example.com" : `student${i + 1}@example.com`,
        password,
        role: "student",
        identifier: nis,
      },
    });
    students.push(student);
  }

  // ── Classes ─────────────────────────────────────────────────
  const bioClass = await prisma.class.create({
    data: {
      name: "Biologi XI MIPA 1",
      subject: "Biologi",
      grade: "Kelas XI",
      academicYear: "2026/2027 Ganjil",
      classCode: "BIO-XI-882",
      creatorId: teacher1.id,
    },
  });

  const fisikaClass = await prisma.class.create({
    data: {
      name: "Fisika X MIPA 2",
      subject: "Fisika",
      grade: "Kelas X",
      academicYear: "2026/2027 Ganjil",
      classCode: "FIS-X-471",
      creatorId: teacher2.id,
    },
  });

  const indoClass = await prisma.class.create({
    data: {
      name: "Bahasa Indonesia XI IPS 3",
      subject: "Bahasa Indonesia",
      grade: "Kelas XI",
      academicYear: "2026/2027 Ganjil",
      classCode: "BIN-XI-305",
      creatorId: teacher3.id,
    },
  });

  // Enroll students
  for (const cls of [bioClass, fisikaClass, indoClass]) {
    for (const student of students) {
      await prisma.enrollment.create({
        data: { classId: cls.id, studentId: student.id },
      });
    }
  }

  // ── Helper: build rubric from key points ────────────────────
  function buildRubric(
    qOrder: number,
    maxScore: number,
    keyPoints: string[]
  ): { name: string; weight: number; maxScore: number; description: string; levels: string }[] {
    const count = Math.min(keyPoints.length, 4);
    const points = keyPoints.slice(0, count);
    const base = Math.floor(maxScore / count);
    const remainder = maxScore - base * count;

    return points.map((kp, idx) => {
      const critMax = idx === 0 ? base + remainder : base;
      return {
        name: kp,
        weight: Math.round((critMax / maxScore) * 100),
        maxScore: critMax,
        description: `Pencapaian poin kunci "${kp}" sesuai kunci jawaban acuan.`,
        levels: JSON.stringify([
          {
            score: critMax,
            label: "Sangat Baik",
            description: `Menguraikan poin "${kp}" secara lengkap, akurat, dan koheren.`,
          },
          {
            score: Math.max(1, Math.round(critMax * 0.75)),
            label: "Baik",
            description: `Menjelaskan "${kp}" dengan tepat namun rincian pendukung terbatas.`,
          },
          {
            score: Math.max(1, Math.round(critMax * 0.5)),
            label: "Cukup",
            description: `Menyebutkan "${kp}" secara umum tanpa elaborasi mendalam.`,
          },
          {
            score: 0,
            label: "Kurang",
            description: `Poin "${kp}" belum terjawab atau tidak sesuai kunci jawaban.`,
          },
        ]),
      };
    });
  }

  // ── Assessment 1: Biologi (active) ──────────────────────────
  const bioQuestions = [
    {
      orderNumber: 1,
      prompt:
        "Mengapa fotosintesis disebut sebagai proses yang mengubah energi cahaya menjadi energi kimia?",
      referenceAnswer:
        "Cahaya matahari diserap oleh pigmen klorofil di kloroplas. Energi foton digunakan untuk memecah air (fotolisis) dan menyintesis glukosa. Energi tersebut tersimpan dalam ikatan kimia kovalen glukosa.",
      maxScore: 25,
      keyPoints: ["Penyerapan cahaya oleh klorofil", "Konversi energi cahaya ke kimia", "Penyimpanan dalam ikatan glukosa"],
    },
    {
      orderNumber: 2,
      prompt:
        "Jelaskan perbedaan antara reaksi terang dan reaksi gelap pada fotosintesis.",
      referenceAnswer:
        "Reaksi terang berlangsung di membran tilakoid, membutuhkan cahaya, menghasilkan ATP, NADPH, dan oksigen. Reaksi gelap (siklus Calvin) berlangsung di stroma, tidak memerlukan cahaya secara langsung, dan menggunakan ATP serta NADPH untuk memfiksasi CO₂ menjadi glukosa.",
      maxScore: 25,
      keyPoints: ["Lokasi reaksi terang (tilakoid)", "Lokasi reaksi gelap (stroma)", "Produk ATP dan NADPH", "Fiksasi karbon"],
    },
    {
      orderNumber: 3,
      prompt:
        "Bagaimana hubungan antara fotosintesis dan respirasi seluler dalam siklus energi tumbuhan?",
      referenceAnswer:
        "Fotosintesis menyimpan energi cahaya menjadi glukosa, sedangkan respirasi memecah glukosa untuk melepaskan energi tersebut menjadi ATP. Keduanya membentuk siklus tertutup: produk fotosintesis menjadi substrat respirasi dan sebaliknya.",
      maxScore: 25,
      keyPoints: ["Produk fotosintesis menjadi substrat respirasi", "Pelepasan energi menjadi ATP", "Siklus karbon tertutup"],
    },
    {
      orderNumber: 4,
      prompt:
        "Mengapa fotosintesis penting bagi keseimbangan ekosistem global?",
      referenceAnswer:
        "Fotosintesis menghasilkan oksigen yang dibutuhkan organisme aerob dan menyerap karbon dioksida, sehingga berperan menstabilkan iklim serta menjadi dasar rantai makanan melalui produsen primer.",
      maxScore: 25,
      keyPoints: ["Produksi oksigen", "Penyerapan karbon dioksida", "Produsen primer rantai makanan"],
    },
  ];

  const bioAssessment = await prisma.assessment.create({
    data: {
      classId: bioClass.id,
      creatorId: teacher1.id,
      title: "Ulangan Harian Fotosintesis",
      code: "BIOFOTO88",
      subject: "Biologi",
      status: "active",
      publicationStatus: "unpublished",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      raterCount: 1,
      targetRaters: 1,
      instructions:
        "Jawab seluruh soal esai berikut secara runtut dengan kalimat Anda sendiri. Setiap nomor bernilai 25 poin dengan total 100 poin.",
    },
  });

  for (const q of bioQuestions) {
    const question = await prisma.question.create({
      data: {
        assessmentId: bioAssessment.id,
        orderNumber: q.orderNumber,
        prompt: q.prompt,
        referenceAnswer: q.referenceAnswer,
        maxScore: q.maxScore,
        expectedKeywords: JSON.stringify(q.keyPoints),
      },
    });
    const rubricData = buildRubric(q.orderNumber, q.maxScore, q.keyPoints);
    for (const criterion of rubricData) {
      await prisma.rubricCriterion.create({
        data: { questionId: question.id, ...criterion },
      });
    }
  }

  await prisma.assessmentRater.create({
    data: { assessmentId: bioAssessment.id, raterId: teacher1.id },
  });

  // ── Assessment 2: Fisika (draft) ────────────────────────────
  const fisikaAssessment = await prisma.assessment.create({
    data: {
      classId: fisikaClass.id,
      creatorId: teacher2.id,
      title: "Asesmen Percobaan — Hukum Newton",
      code: "FISHUKUM4",
      subject: "Fisika",
      status: "draft",
      publicationStatus: "unpublished",
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      durationMinutes: 90,
      raterCount: 1,
      targetRaters: 1,
      instructions:
        "Uraikan analisis Anda terhadap percobaan hukum Newton yang telah dilakukan di laboratorium.",
    },
  });

  const fisikaQ = await prisma.question.create({
    data: {
      assessmentId: fisikaAssessment.id,
      orderNumber: 1,
      prompt:
        "Jelaskan mengapa benda yang didorong pada permukaan kasar melambat meskipun gaya dorong tetap diberikan.",
      referenceAnswer:
        "Gaya gesek kinetik bekerja berlawanan arah dengan gerak benda. Resultan gaya menjadi lebih kecil sehingga percepatan menurun dan benda melambat sesuai Hukum II Newton.",
      maxScore: 50,
      expectedKeywords: JSON.stringify(["Gaya gesek kinetik", "Resultan gaya", "Hukum II Newton"]),
    },
  });
  for (const criterion of buildRubric(1, 50, ["Gaya gesek kinetik", "Resultan gaya", "Hukum II Newton"])) {
    await prisma.rubricCriterion.create({
      data: { questionId: fisikaQ.id, ...criterion },
    });
  }

  // ── Assessment 3: Bahasa Indonesia (completed) ──────────────
  const indoAssessment = await prisma.assessment.create({
    data: {
      classId: indoClass.id,
      creatorId: teacher3.id,
      title: "Menulis Teks Argumentasi",
      code: "BINARGUM2",
      subject: "Bahasa Indonesia",
      status: "completed",
      publicationStatus: "published",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 90,
      raterCount: 1,
      targetRaters: 1,
      instructions:
        "Tulis satu paragraf argumentasi mengenai pentingnya literasi digital bagi pelajar.",
    },
  });

  await prisma.question.create({
    data: {
      assessmentId: indoAssessment.id,
      orderNumber: 1,
      prompt: "Mengapa literasi digital penting bagi pelajar di era informasi?",
      referenceAnswer:
        "Literasi digital memungkinkan pelajar menilai kredibilitas sumber, menghindari hoaks, dan memanfaatkan teknologi secara produktif.",
      maxScore: 100,
      expectedKeywords: JSON.stringify(["Kredibilitas sumber", "Anti hoaks", "Produktivitas digital"]),
    },
  });

  // ── Submissions for the Biologi assessment ─────────────────
  const bioQuestionRecords = await prisma.question.findMany({
    where: { assessmentId: bioAssessment.id },
    include: { rubric: true },
    orderBy: { orderNumber: "asc" },
  });

  const answerVariants = [
    ESSAY_ANSWER_STRONG,
    ESSAY_ANSWER_MEDIUM,
    ESSAY_ANSWER_WEAK,
    ESSAY_ANSWER_MEDIUM,
    ESSAY_ANSWER_STRONG,
    ESSAY_ANSWER_MEDIUM,
    ESSAY_ANSWER_WEAK,
    ESSAY_ANSWER_STRONG,
  ];

  for (let i = 0; i < 8; i++) {
    const student = students[i];
    const variant = answerVariants[i % answerVariants.length];

    const isSubmitted = i < 6;
    const isGraded = i < 4;

    const submission = await prisma.submission.create({
      data: {
        assessmentId: bioAssessment.id,
        studentId: student.id,
        statusWork: isSubmitted ? "submitted" : i === 6 ? "draft" : "not_started",
        statusGrading: isGraded ? (i < 3 ? "final" : "draft_graded") : "ungraded",
        submittedAt: isSubmitted
          ? new Date(Date.now() - (i + 1) * 3 * 60 * 60 * 1000)
          : null,
        startedAt: isSubmitted ? new Date(Date.now() - (i + 2) * 3 * 60 * 60 * 1000) : null,
      },
    });

    if (!isSubmitted) continue;

    let totalScore = 0;

    for (const question of bioQuestionRecords) {
      // Build per-criterion scores deterministically
      const scores: Record<string, number> = {};
      for (const crit of question.rubric) {
        const ratio = isGraded
          ? 0.55 + ((pseudoScore(`${student.id}${crit.id}`, 45) as number) / 100) * 0.45
          : 0;
        const value = isGraded ? Math.round(crit.maxScore * ratio) : 0;
        scores[crit.id] = value;
        totalScore += value;
      }

      const answer = await prisma.answer.create({
        data: {
          submissionId: submission.id,
          questionId: question.id,
          studentAnswer: variant,
          charCount: variant.length,
          wordCount: variant.trim().split(/\s+/).length,
          indobertScore: isGraded
            ? Math.min(100, Math.round(totalScore / bioQuestionRecords.length) + 3)
            : null,
          indobertStatus: isGraded ? "available" : "pending",
          finalScore: isGraded
            ? Object.values(scores).reduce((a, b) => a + b, 0)
            : null,
          finalScoreBy: isGraded ? teacher1.id : null,
          finalScoreAt: isGraded
            ? new Date(Date.now() - (i + 1) * 60 * 60 * 1000)
            : null,
          status: isGraded ? "completed" : "waiting_raters",
          teacherFeedback: isGraded
            ? i === 0
              ? "Penjelasan sangat runtut dan tepat. Hubungan energi cahaya dan ikatan glukosa diuraikan dengan baik."
              : "Pemahaman konsep sudah baik, perlu memperdalam bagian fiksasi karbon."
            : "",
        },
      });

      if (isGraded) {
        await prisma.rating.create({
          data: {
            answerId: answer.id,
            raterId: teacher1.id,
            score: Object.values(scores).reduce((a, b) => a + b, 0),
          },
        });

        await prisma.gradeHistory.create({
          data: {
            submissionId: submission.id,
            questionId: question.id,
            raterId: teacher1.id,
            action: "finalized",
            actionLabel: "Penilaian difinalisasi",
            previousScore: null,
            newScore: Object.values(scores).reduce((a, b) => a + b, 0),
            scoreDelta: null,
            note: `Penilaian soal ${question.orderNumber} disahkan oleh penilai tunggal.`,
          },
        });
      }
    }

    if (isGraded) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          overallFinalScore: totalScore,
          finalizedBy: teacher1.id,
          finalizedAt: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("✅ Seed selesai.");
  console.log("");
  console.log("Akun demo (kata sandi semuanya: password)");
  console.log("  Admin   : admin@example.com");
  console.log("  Guru 1  : teacher1@example.com   (Dra. Sri Wahyuni, M.Pd.)");
  console.log("  Guru 2  : teacher2@example.com   (Budi Santoso, S.Pd.)");
  console.log("  Guru 3  : teacher3@example.com   (Nurul Hidayah, S.Pd.)");
  console.log("  Siswa   : student1@example.com   (Aisyah Putri Rahmadani)");
  console.log("");
  console.log(`Total pengguna: ${12 + 4}`);
  console.log(`Total kelas: 3`);
  console.log(`Total asesmen: 3`);
  console.log(`Admin id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
