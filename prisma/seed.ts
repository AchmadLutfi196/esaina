import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "demo1234";

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("🌱 Memulai pengisian database ESAINA dengan dataset skala lengkap...");

  // ─────────────────────────────────────────────────────────────
  // 1. PENGGUNA (GURU, SISWA, ADMIN)
  // ─────────────────────────────────────────────────────────────

  // Guru Pengampu
  const teacher1 = await prisma.user.upsert({
    where: { email: "teacher1@example.com" },
    update: { passwordHash: hash, name: "Dra. Sri Wahyuni, M.Pd.", role: "TEACHER", identifier: "197501012005011001" },
    create: {
      email: "teacher1@example.com",
      name: "Dra. Sri Wahyuni, M.Pd.",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-SRI",
      identifier: "197501012005011001",
    },
  });

  const guruUtama = await prisma.user.upsert({
    where: { email: "guru@demo.sch.id" },
    update: { passwordHash: hash, name: "Bu Dewi, S.Pd.", role: "TEACHER", identifier: "198005122008012001" },
    create: {
      email: "guru@demo.sch.id",
      name: "Bu Dewi, S.Pd.",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-DEMO",
      identifier: "198005122008012001",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "teacher2@example.com" },
    update: { passwordHash: hash, name: "Budi Santoso, S.Pd.", role: "TEACHER", identifier: "198203152008011002" },
    create: {
      email: "teacher2@example.com",
      name: "Budi Santoso, S.Pd.",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-BUDI",
      identifier: "198203152008011002",
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: "teacher3@example.com" },
    update: { passwordHash: hash, name: "Siti Rahmawati, M.Pd.", role: "TEACHER", identifier: "198506222010012003" },
    create: {
      email: "teacher3@example.com",
      name: "Siti Rahmawati, M.Pd.",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-SITI",
      identifier: "198506222010012003",
    },
  });

  const teacher4 = await prisma.user.upsert({
    where: { email: "teacher4@example.com" },
    update: { passwordHash: hash, name: "Ahmad Fauzi, S.Si.", role: "TEACHER", identifier: "198811042012011004" },
    create: {
      email: "teacher4@example.com",
      name: "Ahmad Fauzi, S.Si.",
      passwordHash: hash,
      role: "TEACHER",
      anonCode: "T-FAUZI",
      identifier: "198811042012011004",
    },
  });

  // Admin Sekolah
  const admin1 = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: hash, name: "Drs. Bambang Sudarmono", role: "ADMIN", identifier: "196803121994031001" },
    create: {
      email: "admin@example.com",
      name: "Drs. Bambang Sudarmono",
      passwordHash: hash,
      role: "ADMIN",
      anonCode: "ADM-01",
      identifier: "196803121994031001",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.sch.id" },
    update: { passwordHash: hash, name: "Drs. Bambang Sudarmono", role: "ADMIN", identifier: "196803121994031001" },
    create: {
      email: "admin@demo.sch.id",
      name: "Drs. Bambang Sudarmono",
      passwordHash: hash,
      role: "ADMIN",
      anonCode: "ADM-DEMO",
      identifier: "196803121994031002",
    },
  });

  // Siswa Utama Demo (Tombol Login Cepat)
  const student1Ui = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: { passwordHash: hash, name: "Aisyah Putri Rahmadani", role: "STUDENT", identifier: "20261000" },
    create: {
      email: "student1@example.com",
      name: "Aisyah Putri Rahmadani",
      passwordHash: hash,
      role: "STUDENT",
      anonCode: "S000",
      identifier: "20261000",
    },
  });

  // 25 Siswa Indonesia Otentik
  const studentData = [
    { code: "S001", name: "Ahmad Dani Pratama", id: "20261001" },
    { code: "S002", name: "Bintang Satria Nusantara", id: "20261002" },
    { code: "S003", name: "Cantika Dewi Lestari", id: "20261003" },
    { code: "S004", name: "Dimas Wahyu Nugroho", id: "20261004" },
    { code: "S005", name: "Elvira Maharani", id: "20261005" },
    { code: "S006", name: "Fajar Ilham Hidayat", id: "20261006" },
    { code: "S007", name: "Gita Permata Sari", id: "20261007" },
    { code: "S008", name: "Hafizh Alfarizi", id: "20261008" },
    { code: "S009", name: "Indah Kusuma Wardani", id: "20261009" },
    { code: "S010", name: "Jonathan Kevin Prasetyo", id: "20261010" },
    { code: "S011", name: "Kirei Amanda Putri", id: "20261011" },
    { code: "S012", name: "Luthfi Maulana Malik", id: "20261012" },
    { code: "S013", name: "Mutiara Zahra Salsabila", id: "20261013" },
    { code: "S014", name: "Naufal Rafiqi Akbar", id: "20261014" },
    { code: "S015", name: "Olivia Cinta Kasih", id: "20261015" },
    { code: "S016", name: "Pandu Wijaya Kusuma", id: "20261016" },
    { code: "S017", name: "Qonita Hanum Maulida", id: "20261017" },
    { code: "S018", name: "Rendy Tri Anugrah", id: "20261018" },
    { code: "S019", name: "Sabrina Kirana Daniswara", id: "20261019" },
    { code: "S020", name: "Thoriq Ziyad Robbani", id: "20261020" },
    { code: "S021", name: "Utari Citra Lestari", id: "20261021" },
    { code: "S022", name: "Vano Septian Pratama", id: "20261022" },
    { code: "S023", name: "Widya Astuti Handayani", id: "20261023" },
    { code: "S024", name: "Yoga Pratama Yudha", id: "20261024" },
    { code: "S025", name: "Zaskia Nurul Izzah", id: "20261025" },
  ];

  const students = await Promise.all(
    studentData.map((s) =>
      prisma.user.upsert({
        where: { email: `${s.code.toLowerCase()}@demo.sch.id` },
        update: { passwordHash: hash, name: s.name, identifier: s.id },
        create: {
          email: `${s.code.toLowerCase()}@demo.sch.id`,
          name: s.name,
          passwordHash: hash,
          role: "STUDENT",
          anonCode: s.code,
          identifier: s.id,
        },
      })
    )
  );

  const allStudents = [student1Ui, ...students];
  console.log(`✓ 5 Guru, 2 Admin, dan ${allStudents.length} Siswa tersimpan.`);

  // ─────────────────────────────────────────────────────────────
  // 2. KELAS MATA PELAJARAN
  // ─────────────────────────────────────────────────────────────

  const classData = [
    {
      joinCode: "XIIA01",
      name: "XII A — Biologi & Sains Hayati",
      teacherId: teacher1.id,
      memberCount: 22,
    },
    {
      joinCode: "XIIC01",
      name: "XII C — Biologi Molekuler & Genetika",
      teacherId: teacher1.id,
      memberCount: 18,
    },
    {
      joinCode: "XIIB01",
      name: "XII B — Ekologi & Bioteknologi Terapan",
      teacherId: guruUtama.id,
      memberCount: 16,
    },
    {
      joinCode: "XIMIPA1",
      name: "XI MIPA 1 — Fisika Termodinamika & Fluida",
      teacherId: teacher2.id,
      memberCount: 18,
    },
    {
      joinCode: "XIMIPA2",
      name: "XI MIPA 2 — Gelombang & Optika Modern",
      teacherId: teacher2.id,
      memberCount: 15,
    },
    {
      joinCode: "XIIIPS1",
      name: "XII IPS 1 — Bahasa & Analisis Argumentasi Esai",
      teacherId: teacher3.id,
      memberCount: 20,
    },
    {
      joinCode: "XIIIPS2",
      name: "XII IPS 2 — Literasi Digital & Teks Eksposisi",
      teacherId: teacher3.id,
      memberCount: 14,
    },
    {
      joinCode: "XAREDOKS",
      name: "X A — Kimia Analisis & Stoikiometri",
      teacherId: teacher4.id,
      memberCount: 16,
    },
    {
      joinCode: "XBORGANIK",
      name: "X B — Kimia Organik & Ikatan Kimia",
      teacherId: teacher4.id,
      memberCount: 12,
    },
  ];

  const classes: Record<string, any> = {};

  for (const c of classData) {
    const cls = await prisma.class.upsert({
      where: { joinCode: c.joinCode },
      update: { teacherId: c.teacherId, name: c.name },
      create: { joinCode: c.joinCode, name: c.name, teacherId: c.teacherId },
    });
    classes[c.joinCode] = cls;

    // Masukkan siswa ke kelas sesuai kuota
    const enrolledStudents = allStudents.slice(0, c.memberCount);
    await Promise.all(
      enrolledStudents.map((s) =>
        prisma.classMembership.upsert({
          where: { classId_studentId: { classId: cls.id, studentId: s.id } },
          update: {},
          create: { classId: cls.id, studentId: s.id },
        })
      )
    );
  }
  console.log(`✓ ${classData.length} Kelas aktif dengan anggota berhasil disinkronisasi.`);

  // ─────────────────────────────────────────────────────────────
  // 3. ASESMEN, SOAL & RUBRIK DETAIL
  // ─────────────────────────────────────────────────────────────

  // ASESMEN 1 (XII A - Biologi, OPEN): Penilaian Tengah Semester
  const utsIpa = await prisma.assessment.upsert({
    where: { id: "seed-uts-ipa" },
    update: {
      classId: classes["XIIA01"].id,
      title: "Penilaian Tengah Semester: Fisiologi Sel & Fotosintesis",
      instruction:
        "Tuliskan jawaban esai analitis dengan bahasa sendiri. Uraikan tahapan proses biologis, komponen molekul yang terlibat, serta hasil konversi energi secara komprehensif.",
      status: "OPEN",
    },
    create: {
      id: "seed-uts-ipa",
      classId: classes["XIIA01"].id,
      title: "Penilaian Tengah Semester: Fisiologi Sel & Fotosintesis",
      instruction:
        "Tuliskan jawaban esai analitis dengan bahasa sendiri. Uraikan tahapan proses biologis, komponen molekul yang terlibat, serta hasil konversi energi secara komprehensif.",
      status: "OPEN",
      openedAt: new Date(Date.now() - 7 * 86400000),
      closedAt: new Date(Date.now() + 5 * 86400000),
    },
  });

  const utsQ1 = await prisma.question.upsert({
    where: { assessmentId_order: { assessmentId: utsIpa.id, order: 1 } },
    update: {},
    create: {
      assessmentId: utsIpa.id,
      order: 1,
      text: "Jelaskan proses fotolisis air dan aliran elektron pada reaksi terang fotosintesis serta sebutkan produk akhir yang dihasilkan!",
      referenceAnswer:
        "Fotolisis air terjadi di membran tilakoid kloroplas ketika foton diserap oleh pigmen fotosistem II (P680). Molekul air (H2O) dipecah menjadi elektron, ion proton (H+), dan gas oksigen (O2). Elektron dialirkan melalui rantai transpor elektron (plastokinon, kompleks sitokrom b6f, dan plastosianin) menuju fotosistem I (P700). Energi aliran elektron memompa proton ke lumen tilakoid menghasilkan gradien elektrokimia untuk sintesis ATP via ATP sintase. Pada fotosistem I, elektron mereduksi NADP+ menjadi NADPH dengan enzim ferredoksin-NADP+ reduktase. Produk akhir reaksi terang adalah ATP, NADPH, dan O2.",
      maxScore: 6,
    },
  });

  const q1Criteria = [
    { code: "C1", description: "Menjelaskan mekanisme fotolisis air dan pemecahan H2O", minScore: 0, maxScore: 2 },
    { code: "C2", description: "Menjelaskan aliran rantai transpor elektron dan fotofosforilasi", minScore: 0, maxScore: 2 },
    { code: "C3", description: "Menyebutkan produk akhir reaksi terang (ATP, NADPH, O2)", minScore: 0, maxScore: 2 },
  ];

  const utsQ1Criteria = await Promise.all(
    q1Criteria.map((c, i) =>
      prisma.rubricCriterion.upsert({
        where: { questionId_code: { questionId: utsQ1.id, code: c.code } },
        update: {},
        create: {
          questionId: utsQ1.id,
          code: c.code,
          description: c.description,
          minScore: c.minScore,
          maxScore: c.maxScore,
          order: i + 1,
          levels: [
            { score: 0, label: "Tidak Ada", description: "Konsep tidak disebutkan atau salah sama sekali." },
            { score: 1, label: "Parsial", description: "Menyebutkan konsep namun belum runtut atau komponen kurang." },
            { score: 2, label: "Lengkap & Akurat", description: "Penjelasan tepat, ilmiah, dan mencakup semua indikator." },
          ],
        },
      })
    )
  );

  const utsQ2 = await prisma.question.upsert({
    where: { assessmentId_order: { assessmentId: utsIpa.id, order: 2 } },
    update: {},
    create: {
      assessmentId: utsIpa.id,
      order: 2,
      text: "Mengapa fiksasi karbon pada tanaman tipe CAM terjadi pada malam hari, dan apa keunggulannya di lingkungan kering?",
      referenceAnswer:
        "Tanaman CAM (Crassulacean Acid Metabolism) mengadaptasi stomatanya untuk membuka hanya pada malam hari saat suhu lebih dingin dan kelembaban lebih tinggi, sehingga meminimalkan kehilangan air akibat transpirasi (evapotranspirasi). Pada malam hari, CO2 diambil dan difiksasi oleh enzim PEP karboksilase menjadi oksaloasetat lalu direduksi menjadi asam malat yang disimpan di vakuola. Pada siang hari, stomata menutup rapat untuk mencegah dehidrasi, asam malat didekarboksilasi untuk melepaskan CO2 langsung ke siklus Calvin di stroma kloroplas di bawah cahaya matahari. Keunggulannya adalah efisiensi penggunaan air yang sangat tinggi pada habitat xerofit/gurun.",
      maxScore: 4,
    },
  });

  const q2Criteria = [
    { code: "C1", description: "Menjelaskan pembukaan stomata malam hari dan pencegahan transpirasi", minScore: 0, maxScore: 2 },
    { code: "C2", description: "Menjelaskan fiksasi PEP karboksilase dan penyimpanan asam malat", minScore: 0, maxScore: 2 },
  ];

  const utsQ2Criteria = await Promise.all(
    q2Criteria.map((c, i) =>
      prisma.rubricCriterion.upsert({
        where: { questionId_code: { questionId: utsQ2.id, code: c.code } },
        update: {},
        create: {
          questionId: utsQ2.id,
          code: c.code,
          description: c.description,
          minScore: c.minScore,
          maxScore: c.maxScore,
          order: i + 1,
          levels: [
            { score: 0, label: "Tidak Ada", description: "Tidak memahami adaptasi fisiologis CAM." },
            { score: 1, label: "Parsial", description: "Hanya menyebut stomata buka malam hari tanpa jalur kimia." },
            { score: 2, label: "Lengkap", description: "Menguraikan transpirasi dan enzim PEP karboksilase dengan tepat." },
          ],
        },
      })
    )
  );

  // ASESMEN 2 (XII A - Biologi, CLOSED): Penilaian Akhir Semester Genetika
  const uasGenetika = await prisma.assessment.upsert({
    where: { id: "seed-uas-genetika" },
    update: {
      classId: classes["XIIA01"].id,
      title: "Penilaian Akhir Semester: Genetika Molekuler & Sintesis Protein",
      instruction: "Analisis perbedaan proses ekspresi genetik serta mekanisme mutasi DNA.",
      status: "CLOSED",
    },
    create: {
      id: "seed-uas-genetika",
      classId: classes["XIIA01"].id,
      title: "Penilaian Akhir Semester: Genetika Molekuler & Sintesis Protein",
      instruction: "Analisis perbedaan proses ekspresi genetik serta mekanisme mutasi DNA.",
      status: "CLOSED",
      openedAt: new Date(Date.now() - 20 * 86400000),
      closedAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  const uasQ1 = await prisma.question.upsert({
    where: { assessmentId_order: { assessmentId: uasGenetika.id, order: 1 } },
    update: {},
    create: {
      assessmentId: uasGenetika.id,
      order: 1,
      text: "Uraikan tahapan inisiasi, elongasi, dan terminasi pada proses translasi mRNA di ribosom!",
      referenceAnswer:
        "Translasi mRNA di ribosom terdiri dari: 1) Inisiasi: subunit kecil ribosom berikatan dengan mRNA pada kodon start AUG, tRNA inisiator membawa metionin melekat di situs P, lalu subunit besar ribosom bergabung. 2) Elongasi: aminoasil-tRNA baru masuk ke situs A sesuai kodon, ikatan peptida dibentuk oleh peptidil transferase antara asam amino, dan ribosom bertranslokasi memindahkan tRNA ke situs E untuk keluar. 3) Terminasi: ketika ribosom menemui kodon stop (UAA, UAG, atau UGA), faktor pelepasan (release factor) memecah rantai polipeptida yang telah terbentuk.",
      maxScore: 6,
    },
  });

  await prisma.rubricCriterion.upsert({
    where: { questionId_code: { questionId: uasQ1.id, code: "C1" } },
    update: {},
    create: {
      questionId: uasQ1.id,
      code: "C1",
      description: "Menjelaskan tahap inisiasi dan kodon start AUG",
      minScore: 0,
      maxScore: 3,
      order: 1,
      levels: [
        { score: 0, label: "Kurang", description: "Tidak mengerti inisiasi translasi." },
        { score: 2, label: "Cukup", description: "Menyebutkan ribosom dan kodon start tanpa detail situs P." },
        { score: 3, label: "Sangat Baik", description: "Lengkap dengan subunit ribosom dan situs P." },
      ],
    },
  });

  await prisma.rubricCriterion.upsert({
    where: { questionId_code: { questionId: uasQ1.id, code: "C2" } },
    update: {},
    create: {
      questionId: uasQ1.id,
      code: "C2",
      description: "Menjelaskan tahap elongasi dan terminasi via kodon stop",
      minScore: 0,
      maxScore: 3,
      order: 2,
      levels: [
        { score: 0, label: "Kurang", description: "Tidak mengerti elongasi." },
        { score: 2, label: "Cukup", description: "Menyebutkan kodon stop tanpa mekanisme release factor." },
        { score: 3, label: "Sangat Baik", description: "Lengkap dengan translokasi ribosom dan terminasi pelepasan polipeptida." },
      ],
    },
  });

  // ASESMEN 3 (XII B - Biologi, OPEN): Ulangan Harian Ekosistem
  await prisma.assessment.upsert({
    where: { id: "seed-uh-ekosistem" },
    update: {
      classId: classes["XIIB01"].id,
      title: "Ulangan Harian: Jaring Makanan & Daur Biogeokimia",
      instruction: "Jelaskan aliran energi serta dampak pencemaran zat karsinogenik terhadap tingkatan trofik.",
      status: "OPEN",
    },
    create: {
      id: "seed-uh-ekosistem",
      classId: classes["XIIB01"].id,
      title: "Ulangan Harian: Jaring Makanan & Daur Biogeokimia",
      instruction: "Jelaskan aliran energi serta dampak pencemaran zat karsinogenik terhadap tingkatan trofik.",
      status: "OPEN",
      openedAt: new Date(Date.now() - 3 * 86400000),
      closedAt: new Date(Date.now() + 4 * 86400000),
    },
  });

  // ASESMEN 4 (XI MIPA 1 - Fisika, OPEN): Siklus Termodinamika
  const fisikaTermo = await prisma.assessment.upsert({
    where: { id: "seed-fisika-termo" },
    update: {
      classId: classes["XIMIPA1"].id,
      title: "Kuis Esai: Siklus Carnot & Entropi Termodinamika",
      instruction: "Tuliskan formulasi efisiensi termal dan penurunan matematis siklus Carnot reversibel.",
      status: "OPEN",
    },
    create: {
      id: "seed-fisika-termo",
      classId: classes["XIMIPA1"].id,
      title: "Kuis Esai: Siklus Carnot & Entropi Termodinamika",
      instruction: "Tuliskan formulasi efisiensi termal dan penurunan matematis siklus Carnot reversibel.",
      status: "OPEN",
      openedAt: new Date(Date.now() - 2 * 86400000),
      closedAt: new Date(Date.now() + 6 * 86400000),
    },
  });

  await prisma.question.upsert({
    where: { assessmentId_order: { assessmentId: fisikaTermo.id, order: 1 } },
    update: {},
    create: {
      assessmentId: fisikaTermo.id,
      order: 1,
      text: "Mengapa efisiensi mesin termal riil tidak pernah dapat mencapai 100% dan bagaimana Hukum II Termodinamika menjelaskannya?",
      referenceAnswer:
        "Menurut Hukum II Termodinamika (pernyataan Kelvin-Planck), tidak mungkin membuat mesin kalor yang bekerja dalam satu siklus yang hanya menyerap kalor dari satu reservoir dan mengubah seluruhnya menjadi kerja mekanik tanpa membuang sebagian kalor ke reservoir bersuhu lebih rendah. Efisiensi siklus Carnot dibatasi oleh rasio suhu reservoir: eta = 1 - (TL/TH). Agar efisiensi mencapai 100%, suhu reservoir dingin TL harus 0 Kelvin (nol mutlak), yang secara termodinamika tidak dapat dicapai menurut Hukum Ketiga Termodinamika. Selain itu, pada mesin riil selalu terjadi irreversibilitas akibat gesekan mekanik dan disipasi panas.",
      maxScore: 6,
    },
  });

  // ASESMEN 5 (XII IPS 1 - B. Indonesia, OPEN): Esai Argumentasi
  await prisma.assessment.upsert({
    where: { id: "seed-bindo-esai" },
    update: {
      classId: classes["XIIIPS1"].id,
      title: "Esai Argumentatif: Etika Kecerdasan Buatan dalam Pendidikan",
      instruction: "Susun esai argumentatif yang memuat tesis yang jelas, argumen berlandaskan data, dan rekomendasi etis.",
      status: "OPEN",
    },
    create: {
      id: "seed-bindo-esai",
      classId: classes["XIIIPS1"].id,
      title: "Esai Argumentatif: Etika Kecerdasan Buatan dalam Pendidikan",
      instruction: "Susun esai argumentatif yang memuat tesis yang jelas, argumen berlandaskan data, dan rekomendasi etis.",
      status: "OPEN",
      openedAt: new Date(Date.now() - 5 * 86400000),
      closedAt: new Date(Date.now() + 2 * 86400000),
    },
  });

  // ASESMEN 6 (XII A - Biologi, DRAFT): Draft Persiapan Guru
  await prisma.assessment.upsert({
    where: { id: "seed-draft-biotek" },
    update: {
      classId: classes["XIIA01"].id,
      title: "Rancangan Proyek Esai: Rekayasa Genetika & Bioetika CRISPR-Cas9",
      instruction: "Draf penugasan semester ganjil untuk analisis studi kasus rekayasa genom pada tanaman transgenik.",
      status: "DRAFT",
    },
    create: {
      id: "seed-draft-biotek",
      classId: classes["XIIA01"].id,
      title: "Rancangan Proyek Esai: Rekayasa Genetika & Bioetika CRISPR-Cas9",
      instruction: "Draf penugasan semester ganjil untuk analisis studi kasus rekayasa genom pada tanaman transgenik.",
      status: "DRAFT",
    },
  });

  console.log("✓ 6 Asesmen lintas mata pelajaran dan status (OPEN, CLOSED, DRAFT) siap.");

  // ─────────────────────────────────────────────────────────────
  // 4. SUBMISI SISWA & JAWABAN REALISTIS (PTS BIOLOGI XII A)
  // ─────────────────────────────────────────────────────────────

  // Bersihkan data turunan hasil seed sebelumnya agar skrip idempoten.
  const seededAssessmentIds = [
    utsIpa.id,
    uasGenetika.id,
    "seed-uh-ekosistem",
    fisikaTermo.id,
    "seed-bindo-esai",
    "seed-draft-biotek",
    "seed-fisika-gelombang",
    "seed-kimia-stoikio",
    "seed-xiic-dna",
    "seed-ips2-eksposisi",
    "seed-xb-organik",
  ];
  // Hapus kelas sisa seed lama yang tidak lagi dipakai.
  await prisma.class.deleteMany({
    where: { joinCode: { notIn: classData.map((c) => c.joinCode) } },
  });
  await prisma.auditEvent.deleteMany({
    where: {
      OR: [
        { entityId: { in: seededAssessmentIds } },
        { entityId: { in: Object.values(classes).map((c: any) => c.id) } },
      ],
    },
  });
  await prisma.publication.deleteMany({
    where: { assessmentId: { in: seededAssessmentIds } },
  });
  await prisma.gradeItem.deleteMany({
    where: { revision: { submission: { assessmentId: { in: seededAssessmentIds } } } },
  });
  await prisma.gradeRevision.deleteMany({
    where: { submission: { assessmentId: { in: seededAssessmentIds } } },
  });
  await prisma.aIResult.deleteMany({
    where: { submission: { assessmentId: { in: seededAssessmentIds } } },
  });

  // Ragam respons esai siswa: berkualitas tinggi, sedang, parsial, dan ada miskonsepsi
  const submissionData = [
    {
      student: student1Ui, // Aisyah Putri Rahmadani (Siswa demo login)
      status: "FINAL_PUBLISHED",
      answers: [
        {
          order: 1,
          content:
            "Fotolisis air terjadi di membran tilakoid kloroplas saat molekul klorofil di fotosistem II (P680) menyerap energi foton cahaya matahari. Akibat eksitasi ini, air (H2O) dipecah oleh kompleks enzim fotolisis menjadi elektron, proton H+, dan gas oksigen (O2). Elektron yang dilepaskan masuk ke rantai transpor elektron melewati plastokinon, kompleks sitokrom, dan plastosianin menuju fotosistem I. Pergerakan elektron ini memicu pemompaan ion H+ ke dalam lumen tilakoid sehingga menciptakan gradien proton yang menggerakkan sintesis ATP. Pada fotosistem I, elektron mereduksi NADP+ menjadi NADPH dengan bantuan enzim ferredoksin reduktase. Oleh karena itu, produk akhir dari reaksi terang fotosintesis adalah molekul ATP, NADPH, dan gas oksigen sebagai produk sampingan.",
          scores: { C1: 2, C2: 2, C3: 2 }, // Total: 6
          feedback:
            "Penjelasan sangat komprehensif, runtut, dan menyebutkan seluruh molekul perantara serta produk akhir reaksi terang dengan tepat.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM beradaptasi pada lingkungan xerofit yang kering dan panas. Pada siang hari, pembukaan stomata akan memicu kehilangan air masif melalui proses transpirasi. Karena itu, stomata tanaman CAM hanya terbuka pada malam hari ketika suhu udara lebih dingin. Karbon dioksida yang masuk difiksasi oleh enzim PEP karboksilase menjadi oksaloasetat dan diubah menjadi asam malat untuk disimpan dalam vakuola sel. Pada siang hari saat stomata menutup rapat untuk mencegah penguapan, asam malat didekarboksilasi melepaskan CO2 langsung ke siklus Calvin dengan suplai ATP dari reaksi terang matahari. Keunggulan fisiologis ini memberi efisiensi penggunaan air hingga lima kali lebih tinggi dibandingkan tanaman C3.",
          scores: { C1: 2, C2: 2 }, // Total: 4
          feedback: "Analisis adaptasi stomata dan peran asam malat sangat mendalam. Kerja bagus!",
        },
      ],
      totalScore: 10,
    },
    {
      student: students[0], // Ahmad Dani Pratama (S001)
      status: "FINAL_PUBLISHED",
      answers: [
        {
          order: 1,
          content:
            "Proses fotosintesis pada reaksi terang diawali dengan fotolisis air di kloroplas. Molekul air H2O dipecah menghasilkan elektron dan gas oksigen O2. Elektron tersebut ditranspor melalui fotosistem 2 ke fotosistem 1 melalui rantai transpor elektron. Pada akhir proses ini, energi cahaya berhasil disimpan dalam bentuk ATP dan NADPH yang akan dipakai untuk siklus Calvin.",
          scores: { C1: 2, C2: 1, C3: 2 }, // Total: 5
          feedback: "Mekanisme pemompaan proton ke lumen tilakoid belum dijelaskan secara terperinci.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM seperti kaktus membuka stomatanya di malam hari karena suhu di gurun pada siang hari sangat panas dan membakar. Jika stomata terbuka siang hari, tumbuhan akan cepat layu karena transpirasi. CO2 disimpan sementara dalam bentuk asam organik dan diproses saat matahari bersinar.",
          scores: { C1: 2, C2: 1 }, // Total: 3
          feedback: "Sebutkan nama enzim PEP karboksilase dan asam malat secara spesifik.",
        },
      ],
      totalScore: 8,
    },
    {
      student: students[1], // Bintang Satria Nusantara (S002)
      status: "DRAFT_GRADED",
      answers: [
        {
          order: 1,
          content:
            "Fotolisis adalah penguraian molekul air oleh sinar matahari di tilakoid. Reaksi ini menghasilkan ion H+ dan gas oksigen. Elektron mengalir melewati protein pembawa membran untuk membentuk ATP dan NADPH.",
          scores: { C1: 1, C2: 1, C3: 2 }, // Total: 4
          feedback: "Coba jelaskan perbedaan fotosistem II dan fotosistem I pada aliran elektron.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM menghemat air di daerah kering dengan membuka pori-pori daun pada malam hari. CO2 diambil malam hari dan disimpan di vakuola.",
          scores: { C1: 1, C2: 1 }, // Total: 2
          feedback: "Perlu ditambahkan penjelasan mengenai siklus Calvin pada siang hari.",
        },
      ],
      totalScore: 6,
    },
    {
      student: students[2], // Cantika Dewi Lestari (S003)
      status: "DRAFT_GRADED",
      answers: [
        {
          order: 1,
          content:
            "Reaksi terang fotosintesis terjadi di tilakoid. Air dipecah menjadi O2 dan elektron. Elektron berjalan menghasilkan energi ATP. Hasil akhirnya adalah glukosa dan oksigen.",
          scores: { C1: 1, C2: 1, C3: 1 }, // Miskonsepsi: glukosa adalah produk reaksi gelap
          feedback:
            "Perhatikan: glukosa dihasilkan pada reaksi gelap (siklus Calvin), bukan produk langsung reaksi terang.",
        },
        {
          order: 2,
          content:
            "Fiksasi karbon terjadi malam hari supaya air tidak cepat menguap karena udara malam lebih sejuk dan lembab.",
          scores: { C1: 1, C2: 0 },
          feedback: "Jalur kimia fiksasi asam malat belum dijawab.",
        },
      ],
      totalScore: 3,
    },
    {
      student: students[3], // Dimas Wahyu Nugroho (S004) - Ungraded (Ready to Grade in UI)
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Fotolisis air terjadi di fotosistem II membran tilakoid kloroplas di mana molekul 2H2O dipecah menjadi 4H+ + 4e- + O2. Aliran elektron non-siklik bergerak dari PSII ke plastokuinon, kompleks sitokrom b6f, plastosianin, lalu ke PSI (P700). Elektron berenergi tinggi dari PSI diterima oleh feredoksin untuk mereduksi NADP+ menjadi NADPH melalui enzim FNR. Pompa ion H+ memicu kemiosmosis pada ATP sintase untuk mensintesis ATP. Hasil akhirnya: ATP, NADPH, dan O2.",
        },
        {
          order: 2,
          content:
            "Tanaman tipe CAM membuka stomata pada malam hari untuk meminimalkan evaporasi air di daerah xerofit yang gersang. Pada malam hari CO2 difiksasi oleh phosphoenolpyruvate (PEP) carboxylase menjadi malat dan disimpan dalam vakuola. Pada siang hari stomata menutup dan malat melepaskan CO2 untuk siklus Calvin.",
        },
      ],
    },
    {
      student: students[4], // Elvira Maharani (S005) - Ungraded
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Fotolisis air memecah H2O menjadi elektron, proton dan oksigen saat terkena cahaya matahari di daun kloroplas. Elektron ini mengalir melalui fotosistem 2 dan fotosistem 1 untuk membuat ATP dan NADPH.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM hidup di gurun pasir. Untuk bertahan hidup agar air tidak habis, mereka membuka stomata malam hari dan menutupnya saat siang terik.",
        },
      ],
    },
    {
      student: students[5], // Fajar Ilham Hidayat (S006) - Ungraded
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Pada reaksi terang di tilakoid, cahaya memecah molekul air menghasilkan elektron dan oksigen. Elektron menghasilkan ATP dan NADPH yang kemudian dialirkan ke stroma untuk siklus gelap.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM mengikat karbon malam hari karena siang hari suhu sangat tinggi sehingga transpirasi berlebihan dapat mematikan tumbuhan.",
        },
      ],
    },
    {
      student: students[6], // Gita Permata Sari (S007) - Ungraded
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Fotolisis adalah penguraian molekul H2O menjadi H+, O2, dan elektron oleh klorofil P680 di grana. Elektron tersebut mengalir melewati rantai transport membran menghasilkan NADPH dan energi ATP. Produk akhirnya oksigen, ATP, dan NADPH.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM seperti nanas dan anggrek menutup stomata di siang hari guna mencegah kehilangan cairan. Gas karbon dioksida diikat pada malam hari menjadi asam malat oleh enzim PEP karboksilase.",
        },
      ],
    },
    {
      student: students[7], // Hafizh Alfarizi (S008) - Ungraded
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Cahaya matahari diserap oleh klorofil tilakoid lalu memecah air menjadi oksigen dan elektron. Elektron bergerak untuk membentuk energi biokimiawi sel.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM stomatanya aktif malam hari agar kelembaban tetap terjaga di tempat tandus dan gersang.",
        },
      ],
    },
    {
      student: students[8], // Indah Kusuma Wardani (S009) - Ungraded
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Fotolisis air adalah proses pemecahan molekul air menjadi hidrogen dan oksigen dengan bantuan energi cahaya matahari pada reaksi terang fotosintesis di dalam membran tilakoid. Elektron dialirkan menghasilkan ATP dan NADPH.",
        },
        {
          order: 2,
          content:
            "Karena di tempat kering tanaman CAM harus menghemat kadar air, mereka membuka stomata waktu malam untuk menyerap CO2 dan menyimpannya sampai siang hari.",
        },
      ],
    },
    {
      student: students[9], // Jonathan Kevin (S010) - Ungraded
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Air dipecah oleh fotosistem 2 menjadi oksigen yang kita hirup, dan ion elektron. Elektron mengalir ke fotosistem 1 untuk menghasilkan energi seluler ATP dan NADPH.",
        },
        {
          order: 2,
          content:
            "Tanaman CAM mengikat karbon dioksida pada waktu malam hari dengan asam organik agar stomata tidak perlu dibuka saat matahari bersinar terik di siang hari.",
        },
      ],
    },
    {
      student: students[10], // Kirei Amanda Putri (S011) - Ungraded
      status: "UNGRADED",
      answers: [
        {
          order: 1,
          content:
            "Fotolisis adalah reaksi penguraian H2O menjadi H+ dan O2 di dalam grana kloroplas. Elektron mengalir lewat sistem transpor membran menghasilkan produk akhir ATP, NADPH, dan gas O2.",
        },
        {
          order: 2,
          content:
            "Keunggulan tanaman CAM adalah toleransi kekeringan yang sangat tinggi karena stomata hanya terbuka di malam hari sehingga laju transpirasi sangat rendah.",
        },
      ],
    },
  ];

  // Simpan submisi ke database
  for (const item of submissionData) {
    const sub = await prisma.submission.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId: utsIpa.id,
          studentId: item.student.id,
        },
      },
      update: {
        status: "SUBMITTED",
        submittedAt: new Date(Date.now() - Math.floor(Math.random() * 4 + 1) * 86400000),
      },
      create: {
        assessmentId: utsIpa.id,
        studentId: item.student.id,
        status: "SUBMITTED",
        submittedAt: new Date(Date.now() - Math.floor(Math.random() * 4 + 1) * 86400000),
      },
    });

    // Simpan Jawaban Esai
    for (const ans of item.answers) {
      const q = ans.order === 1 ? utsQ1 : utsQ2;
      await prisma.answer.upsert({
        where: {
          submissionId_questionId: {
            submissionId: sub.id,
            questionId: q.id,
          },
        },
        update: { content: ans.content },
        create: {
          submissionId: sub.id,
          questionId: q.id,
          content: ans.content,
        },
      });
    }

    // Jika submisi sudah dinilai (FINAL atau DRAFT)
    if (item.status === "FINAL_PUBLISHED" || item.status === "DRAFT_GRADED") {
      const isFinal = item.status === "FINAL_PUBLISHED";
      const rev = await prisma.gradeRevision.create({
        data: {
          submissionId: sub.id,
          authorId: teacher1.id,
          approvedById: isFinal ? teacher1.id : null,
          status: isFinal ? "FINAL" : "DRAFT",
          totalScore: item.totalScore ?? 8,
          approvedAt: isFinal ? new Date() : null,
        },
      });

      // Simpan Item Nilai per Kriteria
      for (const ans of item.answers) {
        const q = ans.order === 1 ? utsQ1 : utsQ2;
        const critList = ans.order === 1 ? utsQ1Criteria : utsQ2Criteria;

        for (const crit of critList) {
          const score = (ans as any).scores?.[crit.code] ?? 1;
          await prisma.gradeItem.create({
            data: {
              revisionId: rev.id,
              questionId: q.id,
              criterionId: crit.id,
              score,
              feedback:
                ans.order === 1
                  ? ((ans as any).feedback ?? "Jawaban cukup baik.")
                  : "Penjelasan sesuai kriteria.",
              source: "MANUAL",
            },
          });
        }
      }

      // Jika Final, buat publikasi resmi agar muncul di rapor / hasil siswa
      if (isFinal) {
        await prisma.publication.create({
          data: {
            assessmentId: utsIpa.id,
            revisionId: rev.id,
            publishedById: teacher1.id,
            publishedAt: new Date(),
          },
        });
      }
    }

    // Buat AI Result rekomendasi asistif untuk beberapa submisi (Explainable AI PRD §6)
    if (item.student.anonCode === "S000" || item.student.anonCode === "S004") {
      await prisma.aIResult.create({
        data: {
          submissionId: sub.id,
          requestedById: teacher1.id,
          provider: "groq",
          model: "llama-3.3-70b-versatile",
          promptVersion: "v1.2-rubric-strict",
          cacheKey: `cache-${sub.id}-v1`,
          sourceVersion: 1,
          validationOk: true,
          tokenUsed: 420,
          payload: {
            overallAssessment:
              "Jawaban siswa menunjukkan penguasaan materi fotosintesis tingkat tinggi. Alur reaksi terang dan adaptasi CAM dijelaskan secara akurat dan ilmiah.",
            suggestedScores: {
              [utsQ1Criteria[0].id]: 2,
              [utsQ1Criteria[1].id]: 2,
              [utsQ1Criteria[2].id]: 2,
              [utsQ2Criteria[0].id]: 2,
              [utsQ2Criteria[1].id]: 2,
            },
            keyEvidenceQuotes: [
              {
                text: "Fotolisis air terjadi di membran tilakoid kloroplas saat molekul klorofil di fotosistem II (P680) menyerap energi foton",
                criterionId: utsQ1Criteria[0].id,
                sentiment: "strength",
                note: "Kutipan presisi menunjukkan pemahaman lokasi membran tilakoid dan eksitasi P680.",
              },
              {
                text: "stomata tanaman CAM hanya terbuka pada malam hari ketika suhu udara lebih dingin. Karbon dioksida yang masuk difiksasi oleh enzim PEP karboksilase",
                criterionId: utsQ2Criteria[0].id,
                sentiment: "strength",
                note: "Menyebutkan enzim PEP karboksilase dan pembukaan stomata malam hari.",
              },
            ],
            improvementTips: [
              "Pertahankan penggunaan istilah biokimiawi formal pada penulisan esai ilmiah.",
            ],
          },
        },
      });
    }
  }

  console.log(`✓ ${submissionData.length} LJK siswa PTS Biologi terisi (Final Terbit, Draf, dan Siap Dinilai).`);

  // ─────────────────────────────────────────────────────────────
  // 4b. SUBMISI PENDUKUNG UNTUK ASESMEN GURU LAIN
  // ─────────────────────────────────────────────────────────────

  const uasQ1Row = await prisma.question.findFirst({
    where: { assessmentId: uasGenetika.id, order: 1 },
    include: { criteria: { orderBy: { order: "asc" } } },
  });

  const fisikaQ1 = await prisma.question.findFirst({
    where: { assessmentId: fisikaTermo.id, order: 1 },
    include: { criteria: { orderBy: { order: "asc" } } },
  });

  // Lengkapi rubrik asesmen Fisika bila belum ada
  if (fisikaQ1 && fisikaQ1.criteria.length === 0) {
    await Promise.all(
      [
        { code: "C1", description: "Menjelaskan batas efisiensi siklus Carnot", maxScore: 3 },
        { code: "C2", description: "Mengaitkan Hukum II & III Termodinamika", maxScore: 3 },
      ].map((c, i) =>
        prisma.rubricCriterion.create({
          data: {
            questionId: fisikaQ1.id,
            code: c.code,
            description: c.description,
            minScore: 0,
            maxScore: c.maxScore,
            order: i + 1,
            levels: [
              { score: 0, label: "Kurang", description: "Tidak memahami konsep entropi." },
              { score: 1, label: "Parsial", description: "Menyebut efisiensi tanpa penurunan rumus." },
              { score: 3, label: "Lengkap", description: "Penurunan rumus dan pembatasan suhu nol mutlak tepat." },
            ],
          },
        })
      )
    );
  }

  const fisikaCriteria = await prisma.rubricCriterion.findMany({
    where: { questionId: fisikaQ1?.id ?? "" },
    orderBy: { order: "asc" },
  });

  const supportSubmissions = [
    {
      assessmentId: uasGenetika.id,
      questionId: uasQ1Row?.id ?? "",
      criteria: uasQ1Row?.criteria ?? [],
      students: [allStudents[0], allStudents[1], allStudents[2], allStudents[3], allStudents[4]],
      content:
        "Translasi terdiri atas tiga tahap. Inisiasi dimulai saat subunit kecil ribosom mengikat mRNA pada kodon start AUG dan tRNA metionin menempati situs P. Elongasi berlangsung ketika aminoasil-tRNA masuk ke situs A, ikatan peptida dibentuk oleh peptidil transferase, dan ribosom bertranslokasi. Terminasi terjadi saat kodon stop UAA/UAG/UGA dibaca dan release factor melepaskan polipeptida.",
      scores: [3, 3],
      finalize: true,
    },
    {
      assessmentId: fisikaTermo.id,
      questionId: fisikaQ1?.id ?? "",
      criteria: fisikaCriteria,
      students: [allStudents[15], allStudents[16], allStudents[17], allStudents[18]],
      content:
        "Efisiensi mesin kalor dibatasi oleh Hukum II Termodinamika sehingga sebagian kalor wajib dibuang ke reservoir bersuhu rendah. Efisiensi Carnot dirumuskan eta = 1 - TL/TH, sehingga efisiensi 100% hanya mungkin bila TL = 0 K yang mustahil dicapai.",
      scores: [3, 2],
      finalize: false,
    },
  ];

  for (const block of supportSubmissions) {
    for (const student of block.students) {
      const sub = await prisma.submission.upsert({
        where: {
          assessmentId_studentId: {
            assessmentId: block.assessmentId,
            studentId: student.id,
          },
        },
        update: { status: "SUBMITTED" },
        create: {
          assessmentId: block.assessmentId,
          studentId: student.id,
          status: "SUBMITTED",
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 5 + 1) * 86400000),
        },
      });

      if (block.questionId) {
        await prisma.answer.upsert({
          where: {
            submissionId_questionId: { submissionId: sub.id, questionId: block.questionId },
          },
          update: { content: block.content },
          create: {
            submissionId: sub.id,
            questionId: block.questionId,
            content: block.content,
          },
        });
      }

      const ownerTeacherId =
        block.assessmentId === fisikaTermo.id ? teacher2.id : teacher1.id;

      const rev = await prisma.gradeRevision.create({
        data: {
          submissionId: sub.id,
          authorId: ownerTeacherId,
          status: block.finalize ? "FINAL" : "DRAFT",
          totalScore: block.scores.reduce((a, b) => a + b, 0),
          approvedById: block.finalize ? ownerTeacherId : null,
          approvedAt: block.finalize ? new Date() : null,
        },
      });

      for (let i = 0; i < block.criteria.length; i++) {
        await prisma.gradeItem.create({
          data: {
            revisionId: rev.id,
            questionId: block.questionId,
            criterionId: block.criteria[i].id,
            score: block.scores[i] ?? 2,
            feedback: "Uraian konsep sudah tepat dan sistematis.",
            source: "MANUAL",
          },
        });
      }

      if (block.finalize) {
        await prisma.publication.create({
          data: {
            assessmentId: block.assessmentId,
            revisionId: rev.id,
            publishedById: ownerTeacherId,
            publishedAt: new Date(),
          },
        });
      }
    }
  }

  console.log("✓ Submisi pendukung Fisika dan Genetika tersimpan.");

  // ─────────────────────────────────────────────────────────────
  // 4c. ASESMEN & SUBMISI UNTUK GURU BAHASA DAN KIMIA
  // ─────────────────────────────────────────────────────────────

  type CriteriaSpec = { code: string; description: string; maxScore: number };

  async function upsertQuestionWithRubric(
    assessmentId: string,
    text: string,
    referenceAnswer: string,
    maxScore: number,
    specs: CriteriaSpec[]
  ) {
    const q = await prisma.question.upsert({
      where: { assessmentId_order: { assessmentId, order: 1 } },
      update: { text, referenceAnswer, maxScore },
      create: { assessmentId, order: 1, text, referenceAnswer, maxScore },
    });

    const criteria = [];
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      criteria.push(
        await prisma.rubricCriterion.upsert({
          where: { questionId_code: { questionId: q.id, code: spec.code } },
          update: { description: spec.description, maxScore: spec.maxScore },
          create: {
            questionId: q.id,
            code: spec.code,
            description: spec.description,
            minScore: 0,
            maxScore: spec.maxScore,
            order: i + 1,
            levels: [
              { score: 0, label: "Belum Tepat", description: "Konsep tidak dijelaskan." },
              { score: Math.max(1, Math.floor(spec.maxScore / 2)), label: "Parsial", description: "Sebagian indikator terpenuhi." },
              { score: spec.maxScore, label: "Lengkap", description: "Seluruh indikator dijelaskan akurat." },
            ],
          },
        })
      );
    }
    return { question: q, criteria };
  }

  async function seedSubmissionsFor(params: {
    assessmentId: string;
    questionId: string;
    criteriaIds: string[];
    studentIds: string[];
    content: string;
    scorePerCriterion: number;
    teacherId: string;
    grade: "UNGRADED" | "DRAFT" | "FINAL";
  }) {
    for (const studentId of params.studentIds) {
      const sub = await prisma.submission.upsert({
        where: { assessmentId_studentId: { assessmentId: params.assessmentId, studentId } },
        update: { status: "SUBMITTED" },
        create: {
          assessmentId: params.assessmentId,
          studentId,
          status: "SUBMITTED",
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 6 + 1) * 86400000),
        },
      });

      await prisma.answer.upsert({
        where: { submissionId_questionId: { submissionId: sub.id, questionId: params.questionId } },
        update: { content: params.content },
        create: { submissionId: sub.id, questionId: params.questionId, content: params.content },
      });

      if (params.grade === "UNGRADED") continue;

      const isFinal = params.grade === "FINAL";
      const rev = await prisma.gradeRevision.create({
        data: {
          submissionId: sub.id,
          authorId: params.teacherId,
          status: isFinal ? "FINAL" : "DRAFT",
          totalScore: params.scorePerCriterion * params.criteriaIds.length,
          approvedById: isFinal ? params.teacherId : null,
          approvedAt: isFinal ? new Date() : null,
        },
      });

      for (const criterionId of params.criteriaIds) {
        await prisma.gradeItem.create({
          data: {
            revisionId: rev.id,
            questionId: params.questionId,
            criterionId,
            score: params.scorePerCriterion,
            feedback: "Struktur argumentasi tersusun rapi dan didukung bukti yang relevan.",
            source: "MANUAL",
          },
        });
      }

      if (isFinal) {
        await prisma.publication.create({
          data: {
            assessmentId: params.assessmentId,
            revisionId: rev.id,
            publishedById: params.teacherId,
            publishedAt: new Date(),
          },
        });
      }
    }
  }

  // Bahasa Indonesia (XII IPS 1) — esai argumentatif, menunggu penilaian
  const bindoQ = await upsertQuestionWithRubric(
    "seed-bindo-esai",
    "Susun paragraf argumentatif mengenai dampak penggunaan AI generatif terhadap kemandirian belajar siswa!",
    "Esai argumentatif wajib memuat tesis yang tegas, minimal dua argumen pendukung dengan data atau contoh konkret, serta kesimpulan yang menegaskan posisi penulis. Argumentasi harus koheren, menggunakan konjungsi kausalitas, dan menghindari generalisasi tanpa bukti.",
    6,
    [
      { code: "C1", description: "Ketegasan tesis dan posisi penulis", maxScore: 2 },
      { code: "C2", description: "Kekuatan argumen dan bukti pendukung", maxScore: 2 },
      { code: "C3", description: "Kohesi, koherensi, dan kesimpulan", maxScore: 2 },
    ]
  );

  await seedSubmissionsFor({
    assessmentId: "seed-bindo-esai",
    questionId: bindoQ.question.id,
    criteriaIds: bindoQ.criteria.map((c) => c.id),
    studentIds: [allStudents[22].id, allStudents[23].id, allStudents[24].id, allStudents[21].id, allStudents[20].id],
    content:
      "Penggunaan AI generatif di ruang belajar memiliki dua sisi yang saling bertentangan. Di satu sisi, AI mempercepat akses referensi dan membantu siswa memahami konsep sulit melalui penjelasan bertingkat. Namun, ketergantungan tanpa batas justru menumpulkan kemampuan bernalar kritis karena siswa terbiasa menerima jawaban instan tanpa proses pencarian. Oleh sebab itu, sekolah perlu menetapkan rambu etis: AI diposisikan sebagai asisten bertanya, bukan pengganti proses berpikir. Dengan begitu, kemandirian belajar tetap terjaga.",
    scorePerCriterion: 2,
    teacherId: teacher3.id,
    grade: "UNGRADED",
  });

  // Fisika Gelombang (XI MIPA 2) — asesmen selesai dan sudah terbit
  const fisikaGelombang = await prisma.assessment.upsert({
    where: { id: "seed-fisika-gelombang" },
    update: { classId: classes["XIMIPA2"].id, status: "CLOSED" },
    create: {
      id: "seed-fisika-gelombang",
      classId: classes["XIMIPA2"].id,
      title: "Ulangan Harian: Interferensi Celah Ganda & Difraksi Cahaya",
      instruction: "Jelaskan pembentukan pola interferensi konstruktif dan destruktif pada percobaan Young.",
      status: "CLOSED",
      openedAt: new Date(Date.now() - 14 * 86400000),
      closedAt: new Date(Date.now() - 7 * 86400000),
    },
  });

  const gelombangQ = await upsertQuestionWithRubric(
    fisikaGelombang.id,
    "Turunkan syarat terjadinya interferensi konstruktif pada celah ganda Young dan jelaskan pengaruh jarak antar celah terhadap jarak pita terang!",
    "Interferensi konstruktif terjadi ketika beda lintasan dua gelombang sama dengan kelipatan bulat panjang gelombang: d sin(theta) = n lambda dengan n = 0, 1, 2, .... Jarak pita terang berurutan pada layar berjarak L adalah delta y = lambda L / d, sehingga semakin lebar jarak antar celah (d), semakin rapat pola terang yang terbentuk.",
    6,
    [
      { code: "C1", description: "Penurunan syarat interferensi konstruktif", maxScore: 3 },
      { code: "C2", description: "Analisis hubungan d terhadap jarak pita", maxScore: 3 },
    ]
  );

  await seedSubmissionsFor({
    assessmentId: fisikaGelombang.id,
    questionId: gelombangQ.question.id,
    criteriaIds: gelombangQ.criteria.map((c) => c.id),
    studentIds: [allStudents[1].id, allStudents[5].id, allStudents[9].id, allStudents[13].id],
    content:
      "Pada percobaan celah ganda, beda lintasan optik antara dua berkas adalah d sin theta. Interferensi konstruktif muncul bila beda lintasan merupakan kelipatan bulat panjang gelombang, sehingga d sin theta = n lambda. Jarak pita terang pada layar dirumuskan delta y = lambda L / d, yang menunjukkan bahwa memperbesar jarak antar celah akan mempersempit jarak antar pita terang.",
    scorePerCriterion: 3,
    teacherId: teacher2.id,
    grade: "FINAL",
  });

  // Kimia Stoikiometri (X A) — menunggu penilaian
  const kimia = await prisma.assessment.upsert({
    where: { id: "seed-kimia-stoikio" },
    update: { classId: classes["XAREDOKS"].id, status: "OPEN" },
    create: {
      id: "seed-kimia-stoikio",
      classId: classes["XAREDOKS"].id,
      title: "Kuis Esai: Pereaksi Pembatas & Rendemen Reaksi",
      instruction: "Uraikan langkah penentuan pereaksi pembatas pada reaksi pembakaran metana.",
      status: "OPEN",
      openedAt: new Date(Date.now() - 2 * 86400000),
      closedAt: new Date(Date.now() + 3 * 86400000),
    },
  });

  const kimiaQ = await upsertQuestionWithRubric(
    kimia.id,
    "Sebanyak 8 gram CH4 direaksikan dengan 32 gram O2. Tentukan pereaksi pembatas, mol CO2 yang terbentuk, dan rendemen jika CO2 terukur 11 gram!",
    "Mol CH4 = 8/16 = 0,5 mol; mol O2 = 32/32 = 1 mol. Persamaan CH4 + 2O2 -> CO2 + 2H2O. Kebutuhan O2 untuk 0,5 mol CH4 adalah 1 mol, sehingga kedua pereaksi habis bersamaan (stoikiometris). Mol CO2 = 0,5 mol setara 22 gram. Rendemen = (11/22) x 100% = 50%.",
    6,
    [
      { code: "C1", description: "Perhitungan mol dan penentuan pereaksi pembatas", maxScore: 3 },
      { code: "C2", description: "Perhitungan massa teoritis dan rendemen", maxScore: 3 },
    ]
  );

  await seedSubmissionsFor({
    assessmentId: kimia.id,
    questionId: kimiaQ.question.id,
    criteriaIds: kimiaQ.criteria.map((c) => c.id),
    studentIds: [allStudents[3].id, allStudents[7].id, allStudents[11].id, allStudents[15].id, allStudents[19].id],
    content:
      "Mol CH4 = 8 gram / 16 gram per mol = 0,5 mol. Mol O2 = 32 gram / 32 gram per mol = 1 mol. Berdasarkan persamaan CH4 + 2O2 menjadi CO2 + 2H2O, satu mol CH4 membutuhkan dua mol O2. Karena tersedia tepat dua kali mol CH4, tidak ada pereaksi pembatas yang tersisa. Mol CO2 = 0,5 mol atau 22 gram secara teoritis. Rendemen = 11/22 x 100% = 50%.",
    scorePerCriterion: 3,
    teacherId: teacher4.id,
    grade: "UNGRADED",
  });

  // Biologi Molekuler (XII C) — selesai & terbit
  const xiic = await prisma.assessment.upsert({
    where: { id: "seed-xiic-dna" },
    update: { classId: classes["XIIC01"].id, status: "CLOSED" },
    create: {
      id: "seed-xiic-dna",
      classId: classes["XIIC01"].id,
      title: "Ulangan Harian: Replikasi DNA & Mutasi Gen",
      instruction: "Jelaskan mekanisme replikasi DNA semi-konservatif dan jenis mutasi titik.",
      status: "CLOSED",
      openedAt: new Date(Date.now() - 12 * 86400000),
      closedAt: new Date(Date.now() - 5 * 86400000),
    },
  });

  const dnaQ = await upsertQuestionWithRubric(
    xiic.id,
    "Uraikan peran enzim helikase, polimerase, dan ligase dalam replikasi DNA semi-konservatif!",
    "Helikase membuka pilinan ganda DNA dengan memutus ikatan hidrogen sehingga membentuk garpu replikasi. Primase menambahkan primer RNA, lalu DNA polimerase III memanjangkan rantai baru searah 5' ke 3' pada rantai leading secara kontinu dan rantai lagging secara terputus-putus (fragmen Okazaki). DNA polimerase I mengganti primer dengan DNA, dan ligase menyambung fragmen menjadi rantai utuh. Hasilnya dua molekul DNA, masing-masing mengandung satu rantai lama dan satu rantai baru (semi-konservatif).",
    6,
    [
      { code: "C1", description: "Peran helikase dan pembentukan garpu replikasi", maxScore: 2 },
      { code: "C2", description: "Peran polimerase pada rantai leading dan lagging", maxScore: 2 },
      { code: "C3", description: "Peran ligase dan sifat semi-konservatif", maxScore: 2 },
    ]
  );

  await seedSubmissionsFor({
    assessmentId: xiic.id,
    questionId: dnaQ.question.id,
    criteriaIds: dnaQ.criteria.map((c) => c.id),
    studentIds: [allStudents[0].id, allStudents[4].id, allStudents[8].id, allStudents[11].id, allStudents[16].id],
    content:
      "Helikase membuka double helix DNA sehingga terbentuk garpu replikasi. DNA polimerase menyusun nukleotida baru searah 5' menuju 3'; pada rantai leading sintesis berlangsung kontinu, sedangkan pada rantai lagging terbentuk fragmen Okazaki. Ligase kemudian menyambung fragmen tersebut. Karena tiap molekul hasil mengandung satu rantai lama dan satu rantai baru, replikasi bersifat semi-konservatif.",
    scorePerCriterion: 2,
    teacherId: teacher1.id,
    grade: "FINAL",
  });

  // Literasi Digital (XII IPS 2) — menunggu penilaian
  const ips2 = await prisma.assessment.upsert({
    where: { id: "seed-ips2-eksposisi" },
    update: { classId: classes["XIIIPS2"].id, status: "OPEN" },
    create: {
      id: "seed-ips2-eksposisi",
      classId: classes["XIIIPS2"].id,
      title: "Esai Eksposisi: Literasi Digital & Verifikasi Informasi",
      instruction: "Susun esai eksposisi tentang strategi memverifikasi hoaks di media sosial.",
      status: "OPEN",
      openedAt: new Date(Date.now() - 1 * 86400000),
      closedAt: new Date(Date.now() + 5 * 86400000),
    },
  });

  const ips2Q = await upsertQuestionWithRubric(
    ips2.id,
    "Jelaskan langkah-langkah sistematis untuk memverifikasi kebenaran informasi yang beredar di media sosial!",
    "Verifikasi dilakukan dengan memeriksa sumber primer, menelusuri tanggal dan konteks unggahan, membandingkan dengan media kredibel, memeriksa metadata gambar melalui reverse image search, serta menahan diri untuk tidak menyebarkan sebelum terkonfirmasi. Literasi digital menuntut sikap skeptis yang sehat terhadap judul sensasional.",
    6,
    [
      { code: "C1", description: "Langkah penelusuran sumber dan konteks", maxScore: 2 },
      { code: "C2", description: "Penggunaan alat verifikasi digital", maxScore: 2 },
      { code: "C3", description: "Sikap kritis dan tanggung jawab penyebaran", maxScore: 2 },
    ]
  );

  await seedSubmissionsFor({
    assessmentId: ips2.id,
    questionId: ips2Q.question.id,
    criteriaIds: ips2Q.criteria.map((c) => c.id),
    studentIds: [allStudents[5].id, allStudents[10].id, allStudents[15].id, allStudents[19].id],
    content:
      "Langkah pertama adalah memeriksa sumber asli informasi, apakah berasal dari akun resmi atau anonim. Selanjutnya memeriksa tanggal unggahan karena banyak konten lama didaur ulang. Saya juga membandingkan dengan portal berita kredibel dan menggunakan pencarian gambar terbalik untuk memastikan foto tidak diambil dari konteks lain. Sebelum terbukti benar, informasi tidak boleh disebarkan.",
    scorePerCriterion: 2,
    teacherId: teacher3.id,
    grade: "UNGRADED",
  });

  // Kimia Organik (X B) — masih draf persiapan guru
  await prisma.assessment.upsert({
    where: { id: "seed-xb-organik" },
    update: { classId: classes["XBORGANIK"].id, status: "DRAFT" },
    create: {
      id: "seed-xb-organik",
      classId: classes["XBORGANIK"].id,
      title: "Rancangan Kuis: Identifikasi Gugus Fungsi Senyawa Organik",
      instruction: "Draf penugasan analisis spektrum IR sederhana untuk identifikasi gugus fungsi.",
      status: "DRAFT",
    },
  });

  console.log("✓ Asesmen Bahasa Indonesia, Fisika Gelombang, dan Kimia terisi submisi.");

  // Ekologi (XII B) — diampu Bu Dewi
  const ekologiQ = await upsertQuestionWithRubric(
    "seed-uh-ekosistem",
    "Jelaskan proses biomagnifikasi DDT pada rantai makanan perairan dan mengapa konsumen puncak paling terdampak!",
    "DDT bersifat lipofilik sehingga terakumulasi dalam jaringan lemak organisme dan tidak mudah diekskresikan. Pada setiap tingkatan trofik, konsumen memakan banyak organisme dari tingkat di bawahnya, sehingga konsentrasi DDT meningkat secara progresif (biomagnifikasi). Konsumen puncak menerima akumulasi terbesar dan mengalami gangguan reproduksi serta penurunan populasi.",
    6,
    [
      { code: "C1", description: "Menjelaskan sifat lipofilik dan akumulasi jaringan", maxScore: 2 },
      { code: "C2", description: "Menjelaskan peningkatan konsentrasi antar trofik", maxScore: 2 },
      { code: "C3", description: "Menyimpulkan dampak pada konsumen puncak", maxScore: 2 },
    ]
  );

  await seedSubmissionsFor({
    assessmentId: "seed-uh-ekosistem",
    questionId: ekologiQ.question.id,
    criteriaIds: ekologiQ.criteria.map((c) => c.id),
    studentIds: [allStudents[2].id, allStudents[6].id, allStudents[12].id, allStudents[14].id],
    content:
      "DDT adalah pestisida yang larut dalam lemak sehingga tersimpan di jaringan tubuh organisme dan sulit dikeluarkan. Karena setiap konsumen memakan banyak individu dari trofik di bawahnya, kadar DDT bertambah pada setiap tingkatan rantai makanan. Akibatnya konsumen puncak seperti burung pemangsa mengalami akumulasi tertinggi sehingga cangkang telurnya menipis dan populasinya menurun.",
    scorePerCriterion: 2,
    teacherId: guruUtama.id,
    grade: "UNGRADED",
  });

  // ─────────────────────────────────────────────────────────────
  // 5. AUDIT EVENTS LOG (MONITORING AKTIVITAS SEKOLAH)
  // ─────────────────────────────────────────────────────────────

  const auditLogs = [
    {
      actorId: admin1.id,
      action: "PUBLISH" as const,
      entityType: "Class",
      entityId: classes["XIIA01"].id,
    },
    {
      actorId: teacher1.id,
      action: "SUBMIT" as const,
      entityType: "Assessment",
      entityId: utsIpa.id,
    },
    {
      actorId: teacher1.id,
      action: "APPLY_AI" as const,
      entityType: "Submission",
      entityId: utsIpa.id,
    },
    {
      actorId: teacher1.id,
      action: "APPROVE" as const,
      entityType: "GradeRevision",
      entityId: utsIpa.id,
    },
    {
      actorId: teacher1.id,
      action: "PUBLISH" as const,
      entityType: "Publication",
      entityId: utsIpa.id,
    },
    {
      actorId: teacher2.id,
      action: "SUBMIT" as const,
      entityType: "Assessment",
      entityId: fisikaTermo.id,
    },
  ];

  await Promise.all(
    auditLogs.map((log) =>
      prisma.auditEvent.create({
        data: {
          actorId: log.actorId,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
        },
      })
    )
  );

  console.log("✓ Log jejak audit aktivitas monitoring sekolah tersimpan.");
  console.log("\n=======================================================");
  console.log("🎉 SEED DATABASE SKALA BESAR BERHASIL LENGKAP!");
  console.log("=======================================================");
  console.log("• Akun Guru 1 (Biologi)   : teacher1@example.com / guru@demo.sch.id");
  console.log("• Akun Guru 2 (Fisika)    : teacher2@example.com");
  console.log("• Akun Guru 3 (B.Indo)    : teacher3@example.com");
  console.log("• Akun Siswa Demo         : student1@example.com (Aisyah Putri Rahmadani)");
  console.log("• Akun Siswa 1 s/d 25     : s001@demo.sch.id s/d s025@demo.sch.id");
  console.log("• Akun Admin              : admin@example.com / admin@demo.sch.id");
  console.log("• Kata Sandi Semua Akun   : password ATAU demo1234");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
