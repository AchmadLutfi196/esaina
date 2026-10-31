import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

function pseudo(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return (hash % (max + 1));
}

// ── 200 Nama Siswa Indonesia Otentik ──────────────────────────────
const STUDENT_NAMES = [
  // Kelas 1 (Biologi XI MIPA 1)
  "Aisyah Putri Rahmadani", "Bagas Wicaksono", "Citra Dewi Lestari", "Dimas Arya Pratama",
  "Eka Nur Fadilah", "Fajar Ramadhan", "Gita Ayu Safitri", "Hafiz Firmansyah",
  "Indah Permata Sari", "Joko Susilo", "Kirana Maharani", "Lukman Hakim",
  "Melati Kusumawati", "Naufal Rizki Aditya", "Olivia Salsabila", "Putra Pratama Wijaya",
  "Qonita Azzahra", "Rizky Maulana", "Siti Nurhaliza", "Taufik Hidayatullah",
  // Kelas 2 (Fisika X MIPA 2)
  "Anisa Dwi Cahyani", "Bima Sakti Nugroho", "Cantika Putri Maharani", "Denny Kurniawan",
  "Elsa Febriana", "Fauzan Akbar", "Galuh Ratna Dewi", "Hanif Maulana",
  "Isna Amelia Putri", "Jihan Aulia Zahra", "Kemal Farhan", "Larasati Widyaputri",
  "Muhammad Ilham Pratama", "Nabila Syarifah", "Oscar Dwi Putra", "Putri Andini Rahma",
  "Qori Intan Permata", "Rafi Ahmad Fauzi", "Salma Khairunnisa", "Teguh Prasetyo",
  // Kelas 3 (Bahasa Indonesia XI IPS 3)
  "Adelia Sari Puspita", "Bintang Cahaya Putra", "Chairunnisa Amalia", "Danu Satria Wibowo",
  "Evita Nur Aini", "Farrel Ananda", "Gisela Margaretha", "Haikal Ramadhan",
  "Ira Wulandari", "Jovanka Christabel", "Kharisma Putri", "Luthfi Maulana Akbar",
  "Mutiara Azzahra Dewi", "Nabil Hakim Prasetya", "Oktavia Ramadhani", "Pramudya Ananta",
  "Quinsha Safira", "Rangga Aditya", "Shafira Nabilah", "Thoriq Fawwaz",
  // Kelas 4 (Kimia XII MIPA 1)
  "Amara Zahra Khansa", "Baskara Putra Nusantara", "Calista Putri Anindia", "Damar Langit Biru",
  "Eriska Dwi Putri", "Firman Adinata", "Ghaida Tsabita", "Helmi Firdaus",
  "Intan Maharani", "Jasmine Aulia", "Kayla Azzahra", "Lanang Setiawan",
  "Marsya Bilqis", "Nanda Pradipta", "Ozan Ramadhani", "Prameswari Ayu",
  "Qiandra Fatiha", "Reyhan Akhdan", "Syifa Amalia", "Tristan Arkananta",
  // Kelas 5 (Matematika X MIPA 3)
  "Alika Putri Zahra", "Bramantyo Aji", "Clarissa Maharani", "Daffa Althaf",
  "Erina Puspitasari", "Farel Kenzie", "Ghania Salsabila", "Harun Arrasyid",
  "Irma Sulistiyani", "Jauza Aida", "Khalisa Rahmawati", "Lintang Semesta",
  "Maheswara Dewa", "Nayla Putri Azzura", "Obi Prayoga", "Padma Ayu Savitri",
  "Qinthara Nadhif", "Raka Mahardika", "Safira Nurul Aini", "Tara Kirana",
  // Kelas 6 (Sejarah Indonesia XI IPS 1)
  "Azzam Muhammad Raffi", "Berliana Sari", "Chelsea Olivia Putri", "Danendra Prasetya",
  "Elang Sakti", "Fadhil Akbar Maulana", "Gemma Aulia", "Haykal Fatahillah",
  "Izzah Mumtazah", "Jibril Alfarizi", "Kamila Putri Cantika", "Labib Muttaqin",
  "Maryam Khairiyah", "Narendra Putra", "Ophelia Zahra", "Pangeran Dirgantara",
  "Qurratu Aini", "Raditya Dimas", "Salsabila Azzahra", "Tsaqif Maulana",
  // Kelas 7 (Ekonomi XII IPS 2)
  "Adinda Maharani", "Bisma Langit", "Calya Sekar Putri", "Dharma Putra Wijaya",
  "Elvira Nurhayati", "Faiq Athallah", "Gladys Permatasari", "Haidar Alfaruq",
  "Inas Syafira", "Javier Andrean", "Keisha Amelia", "Laksamana Putra",
  "Mahira Azzahra", "Nawfal Habibie", "Olive Saphira", "Prabu Siliwangi",
  "Qanita Fauziah", "Rafif Azka", "Shakira Putri", "Tirta Pramudya",
  // Kelas 8 (Sosiologi XI IPS 2)
  "Aqila Zahra Mahira", "Bagus Setiawan", "Charissa Diva", "Daffa Pratama Putra",
  "Elara Putri Ayu", "Fathan Mubarak", "Gendis Larasati", "Hilal Ramadhan",
  "Iftitah Azzahra", "Jalaluddin Ahmad", "Kinara Putri", "Langit Bintang",
  "Miftahul Jannah", "Nauval Akhdan", "Ocha Permata", "Pahlawan Nusantara",
  "Qayla Salsabila", "Reyhan Pratama", "Syahla Khoirunnisa", "Thalita Zahra",
  // Kelas 9 (Geografi X IPS 1)
  "Athaya Rasendriya", "Bintang Pratama", "Cendekia Putri", "Dzaky Maulana",
  "Elysia Maharani", "Fachri Ramadhan", "Ghina Salsabila", "Habib Abdurrahman",
  "Iklima Zahra", "Jauhar Ramadhani", "Keysha Amira", "Lutfiana Hidayati",
  "Mirza Fadhilah", "Nasywa Azzahra", "Omar Farouq", "Puspita Ramadhani",
  "Qisthi Nadhirah", "Rafa Athallah", "Sabrina Putri", "Tegar Prasetyo",
  // Kelas 10 (Seni Rupa XII IPA 1)
  "Arkananta Putra", "Bunga Citra Lestari", "Celina Putri Maharani", "Daffa Arkananta",
  "Embun Pagi Fajar", "Fatih Abdillah", "Ghaisani Putri", "Haidar Naufal",
  "Isyana Sarasvati", "Jauhar Muzakki", "Khanza Putri Ayu", "Lingga Wardhana",
  "Mutiara Hikmah", "Nabil Putra Pratama", "Ozora Arkananta", "Permata Sari Dewi",
  "Qonita Humaira", "Rasyid Hamzah", "Saffana Azzahra", "Tangguh Perkasa",
];

// ── 10 Kelas Beragam Kurikulum Merdeka ─────────────────────────────
const CLASS_SPECS = [
  { name: "Biologi XI MIPA 1", subject: "Biologi", grade: "Kelas XI", code: "BIO-XI-882", ti: 0 },
  { name: "Fisika X MIPA 2", subject: "Fisika", grade: "Kelas X", code: "FIS-X-471", ti: 1 },
  { name: "Bahasa Indonesia XI IPS 3", subject: "Bahasa Indonesia", grade: "Kelas XI", code: "BIN-XI-305", ti: 2 },
  { name: "Kimia XII MIPA 1", subject: "Kimia", grade: "Kelas XII", code: "KIM-XII-619", ti: 0 },
  { name: "Matematika X MIPA 3", subject: "Matematika", grade: "Kelas X", code: "MTK-X-237", ti: 1 },
  { name: "Sejarah Indonesia XI IPS 1", subject: "Sejarah Indonesia", grade: "Kelas XI", code: "SEJ-XI-148", ti: 2 },
  { name: "Ekonomi XII IPS 2", subject: "Ekonomi", grade: "Kelas XII", code: "EKO-XII-593", ti: 0 },
  { name: "Sosiologi XI IPS 2", subject: "Sosiologi", grade: "Kelas XI", code: "SOS-XI-764", ti: 1 },
  { name: "Geografi X IPS 1", subject: "Geografi", grade: "Kelas X", code: "GEO-X-321", ti: 2 },
  { name: "Seni Rupa XII IPA 1", subject: "Seni Rupa", grade: "Kelas XII", code: "SEN-XII-856", ti: 0 },
];

// ── Skenario Nyata Asesmen, Soal & Rubrik ──────────────────────────
const REAL_ASSESSMENTS = [
  {
    ci: 0,
    title: "Penilaian Tengah Semester: Fisiologi Sel & Fotosintesis",
    code: "BIOFOTO88",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 75,
    dueDate: new Date(Date.now() + 5 * 86400000),
    instructions: "Bacalah setiap studi kasus fisiologi tanaman berikut secara saksama. Uraikan analisis Anda secara terstruktur dan ilmiah menggunakan terminologi biokimia yang tepat.",
    questions: [
      {
        prompt: "Sebuah eksperimen pertanian mengaplikasikan herbisida DCMU (Diuron) yang secara spesifik memblokir transfer elektron pada Fotosistem II (PS II). Analisislah dampak molekuler penghambatan tersebut terhadap fotolisis air, gradien proton di lumen tilakoid, serta kelangsungan fiksasi CO₂ pada siklus Calvin!",
        referenceAnswer: "Pemblokiran plastokuinon pada PS II oleh DCMU menghentikan aliran elektron non-siklik. Dampaknya: 1) Fotolisis air berhenti sehingga tidak ada O₂ yang dilepaskan; 2) Pompa proton terhenti sehingga gradien elektrokimia proton (ΔpH) di lumen tilakoid hilang, menyebabkan ATP sintase tidak dapat memproduksi ATP; 3) Pembentukan NADPH terhenti. Akibat ketiadaan ATP dan NADPH, siklus Calvin di stroma berhenti pada fase reduksi 3-PGA menjadi G3P.",
        maxScore: 50,
        expectedKeywords: ["Fotosistem II", "Fotolisis air", "Gradien proton", "ATP sintase", "Siklus Calvin", "NADPH"],
        rubric: [
          { name: "Analisis Aliran Elektron & Fotolisis", maxScore: 15, desc: "Ketepatan menjelaskan terhentinya eksitasi elektron dan fotolisis air pada PS II." },
          { name: "Dinamika Gradien Proton & Kemiosmosis", maxScore: 15, desc: "Penjelasan hilangnya gradien konsentrasi H+ di lumen tilakoid dan dampaknya pada fosforilasi ADP." },
          { name: "Dampak Sistemik Siklus Calvin", maxScore: 10, desc: "Korelasi ketiadaan ATP/NADPH terhadap fiksasi dan reduksi CO2 di stroma." },
          { name: "Keutuhan Logika & Sintaksis Ilmiah", maxScore: 10, desc: "Kerapian struktur argumen, ketepatan istilah biokimia, dan koherensi antarparagraf." },
        ],
      },
      {
        prompt: "Tanaman tipe CAM (Crassulacean Acid Metabolism) memiliki adaptasi temporal dalam membuka stomata. Uraikan mengapa mekanisme fiksasi karbon pada malam hari dan dekarboksilasi pada siang hari menjadi strategi adaptif yang sangat efisien di ekosistem xerofit!",
        referenceAnswer: "Pada malam hari dengan suhu rendah dan kelembapan lebih tinggi, stomata membuka untuk menyerap CO₂ dengan laju transpirasi minimal. CO₂ difiksasi oleh enzim PEP karboksilase menjadi asam oksaloasetat, lalu direduksi menjadi malat dan disimpan dalam vakuola. Pada siang hari saat stomata tertutup rapat untuk mencegah dehidrasi parah, malat dikeluarkan dari vakuola dan didekarboksilasi melepaskan CO₂ langsung ke enzim RuBisCO untuk siklus Calvin yang digerakkan cahaya.",
        maxScore: 50,
        expectedKeywords: ["Stomata malam hari", "PEP karboksilase", "Asam malat", "Vakuola", "RuBisCO", "Efisiensi transpirasi"],
        rubric: [
          { name: "Fiksasi Karbon Temporal Malam Hari", maxScore: 15, desc: "Ketepatan menguraikan peran PEP karboksilase dan pembentukan asam malat dalam vakuola." },
          { name: "Dekarboksilasi Siang Hari & Siklus Calvin", maxScore: 15, desc: "Penjelasan pelepasan CO2 internal ke RuBisCO saat stomata tertutup." },
          { name: "Evaluasi Adaptasi Ekologis Xerofit", maxScore: 10, desc: "Analisis rasio efisiensi transpirasi terhadap penghematan air pada lingkungan arid." },
          { name: "Runtutan Argumen & Terminologi Biologi", maxScore: 10, desc: "Penggunaan istilah fisiologi tumbuhan secara tepat dan alur logika terpadu." },
        ],
      },
    ],
  },
  {
    ci: 1,
    title: "Ujian Esai Analitik: Dinamika Gerak & Rekayasa Keselamatan Jalan",
    code: "FISHUKUM4",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 90,
    dueDate: new Date(Date.now() + 6 * 86400000),
    instructions: "Gunakan prinsip mekanika klasik Newton untuk memecahkan studi kasus kecelakaan dan rekayasa keselamatan transportasi darat. Sertakan penurunan rumus dan hubungan variabel terkait.",
    questions: [
      {
        prompt: "Sebuah truk bermuatan 15 ton melaju dengan kecepatan 72 km/jam di jalan tol. Saat terjadi rintangan mendadak, pengemudi menginjak rem penuh pada permukaan jalan aspal basah (koefisien gesek kinetik μk = 0,35) versus jalan kering (μk = 0,75). Analisislah perbandingan jarak henti dan implikasi gaya gesek kinetik berdasarkan Hukum II Newton!",
        referenceAnswer: "Kecepatan v0 = 72 km/jam = 20 m/s. Gaya gesek kinetik f_k = μk * m * g. Berdasarkan Hukum II Newton, perlambatan a = f_k / m = μk * g. Jarak henti s = v0² / (2a) = v0² / (2 * μk * g). Massa tidak mempengaruhi jarak henti teoritis. Pada aspal kering: a = 0,75 * 9,8 = 7,35 m/s² -> s = 400 / 14,7 ≈ 27,2 m. Pada aspal basah: a = 0,35 * 9,8 = 3,43 m/s² -> s = 400 / 6,86 ≈ 58,3 m. Jarak henti di jalan basah meningkat lebih dari 2 kali lipat.",
        maxScore: 50,
        expectedKeywords: ["Hukum II Newton", "Koefisien gesek kinetik", "Perlambatan a = μg", "Jarak henti", "Independensi massa"],
        rubric: [
          { name: "Penerapan Hukum II Newton & Diagram Gaya", maxScore: 15, desc: "Penurunan gaya normal, gaya gesek kinetik, dan formulasi percepatan perlambatan." },
          { name: "Kalkulasi Perbandingan Jarak Henti", maxScore: 15, desc: "Akurasi matematis perhitungan jarak henti kondisi basah vs kering." },
          { name: "Analisis Kritis Hubungan Variabel", maxScore: 10, desc: "Penjelasan mengapa massa saling meniadakan dalam jarak henti teoritis." },
          { name: "Interpretasi Keselamatan Kendaraan", maxScore: 10, desc: "Pemberian rekomendasi jarak aman iring-iringan kendaraan di jalan raya." },
        ],
      },
      {
        prompt: "Jelaskan prinsip kerja fitur keselamatan modern crumple zone (zona remuk depan) dan kantung udara (airbag) pada mobil ditinjau dari Teorema Impuls-Momentum (I = Δp = F_avg * Δt) dan Hukum I Newton!",
        referenceAnswer: "Hukum I Newton (Inersia) menyatakan bahwa penumpang cenderung mempertahankan gerak majunya saat mobil berhenti mendadak. Teorema Impuls-Momentum menyatakan I = Δp = F_avg * Δt. Karena perubahan momentum penumpang saat berhenti tetap konstan (dari mv menjadi 0), crumple zone dan airbag berfungsi memperpanjang durasi tumbukan (Δt). Dengan memperbesar Δt, gaya rata-rata (F_avg) yang dialami tubuh penumpang berkurang secara drastis, sehingga menurunkan risiko cedera fatal.",
        maxScore: 50,
        expectedKeywords: ["Inersia Hukum I Newton", "Teorema Impuls-Momentum", "Perpanjangan waktu tumbukan Δt", "Reduksi gaya rata-rata F", "Crumple zone"],
        rubric: [
          { name: "Konsep Inersia Tubuh Penumpang", maxScore: 15, desc: "Ketepatan menjelaskan kecenderungan gerak penumpang saat tabrakan frontal." },
          { name: "Aplikasi Teorema Impuls-Momentum", maxScore: 15, desc: "Penjelasan hubungan invers antara durasi kontak Δt dan gaya impak F_avg." },
          { name: "Mekanisme Fisik Rekayasa Otomotif", maxScore: 10, desc: "Analisis deformasi material zona remuk dan bantalan udara kompresi." },
          { name: "Penyusunan Argumen Ilmiah", maxScore: 10, desc: "Artikulasi gagasan fisika yang runtut, lugas, dan terbukti." },
        ],
      },
    ],
  },
  {
    ci: 2,
    title: "Kajian Esai Kritis: Etika Kecerdasan Buatan dalam Integritas Akademik",
    code: "BINARGUM2",
    status: "completed" as const,
    pub: "published" as const,
    dur: 90,
    dueDate: new Date(Date.now() - 4 * 86400000),
    instructions: "Tuliskan esai argumentatif yang berlandaskan fakta empiris, struktur logika persuasif yang kokoh, dan rujukan etis mengenai transformasi teknologi di institusi pendidikan.",
    questions: [
      {
        prompt: "Susunlah esai argumentasi kritis (minimal 3 paragraf) mengenai batas etis pemanfaatan Large Language Model (seperti ChatGPT/Claude) oleh pelajar SMA. Bedakan antara penggunaan AI sebagai 'katalisator penalaran' versus 'jalan pintas kognitif' yang mematikan integritas akademik!",
        referenceAnswer: "Esai harus memuat: 1) Tesis pengantar yang memposisikan AI sebagai instrumen amplifikasi pemikiran, bukan substitusi daya nalar manusia; 2) Argumen pembeda: sebagai katalisator kognitif, AI digunakan untuk brainstorming sudut pandang baru, memvalidasi sintaksis tulisan, dan memperkaya kosa kata tanpa mengambil alih pembuatan ide orisinal. Sebaliknya, copy-paste naskah instan melanggar kejujuran ilmiah, merampas kesempatan pembentukan neuroplastisitas otak dalam merumuskan argumen, dan menghasilkan plagiasi terselubung; 3) Rekomendasi konstruktif bagi guru dan murid melalui asesmen berbasis proses dan transparansi sitasi sumber mesin.",
        maxScore: 100,
        expectedKeywords: ["Integritas akademik", "Katalisator penalaran", "Pintasan kognitif", "Orisinalitas ide", "Etika sitasi AI", "Asesmen proses"],
        rubric: [
          { name: "Ketajaman Tesis & Pendirian Penulis", maxScore: 25, desc: "Kejelasan posisi argumentasi dan kedalaman premis pembuka." },
          { name: "Dialektika Argumen & Bukti Komparatif", maxScore: 35, desc: "Kekuatan distingsi antara amplifikasi nalar versus penggantian kognitif destruktif." },
          { name: "Koherensi Paragraf & Diksi Bahasa Indonesia", maxScore: 25, desc: "Penerapan konjungsi antarkalimat, kekayaan kosakata baku, dan kaidah PUEBI." },
          { name: "Solusi Kontekstual & Integritas Masa Depan", maxScore: 15, desc: "Realisme rekomendasi tata kelola teknologi di lingkungan sekolah." },
        ],
      },
    ],
  },
  {
    ci: 3,
    title: "Studi Kasus Elektrokimia: Mitigasi Korosi Jembatan Maritim",
    code: "KIMREDOX1",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 75,
    dueDate: new Date(Date.now() + 7 * 86400000),
    instructions: "Terapkan prinsip sel volta dan deret kereaktifan logam untuk menganalisis degradasi struktur infrastruktur jembatan bentang panjang di perairan asin.",
    questions: [
      {
        prompt: "Jembatan Suramadu menghadapi tantangan korosi hebat pada tiang pancang baja akibat salinitas air laut Selat Madura. Analisislah proses elektrokimia pembentukan karat besi (Fe) dan jelaskan mengapa anoda korban berbasis Zinc (Zn) atau Magnesium (Mg) mampu memproteksi baja secara katodik!",
        referenceAnswer: "Korosi besi merupakan sel elektrokimia spontan: di anoda, Fe teroksidasi menjadi Fe²⁺ + 2e⁻ (E° = -0,44 V). Elektron mengalir ke daerah katoda di mana oksigen terlarut tereduksi: O₂ + 2H₂O + 4e⁻ -> 4OH⁻. Ion Fe²⁺ dan OH⁻ membentuk endapan Fe(OH)₂ yang teroksidasi lanjut menjadi karat Fe₂O₃.xH₂O. Pada proteksi katodik anoda korban, logam dengan potensial reduksi standar lebih negatif daripada besi (seperti Zn E° = -0,76 V atau Mg E° = -2,37 V) dipasangkan secara elektrik. Seng/Magnesium akan teroksidasi lebih dahulu menyuplai elektron ke besi, memaksa besi bertindak sebagai katoda inert yang terlindungi dari oksidasi.",
        maxScore: 50,
        expectedKeywords: ["Oksidasi besi", "Reduksi oksigen", "Deret Volta / Potensial reduksi standar", "Anoda korban (Sacrificial Anode)", "Proteksi katodik"],
        rubric: [
          { name: "Penjelasan Reaksi Redoks Korosi", maxScore: 15, desc: "Ketepatan persamaan setengah reaksi anodik dan katodik pembentukan karat." },
          { name: "Aplikasi Deret Volta & Potensial E°", maxScore: 15, desc: "Ketepatan analisis nilai potensial standar logam Zn/Mg terhadap Fe." },
          { name: "Mekanisme Proteksi Katodik Anoda Korban", maxScore: 10, desc: "Uraian aliran elektron pengorbanan anoda untuk menjaga baja tetap katodik." },
          { name: "Struktur Penjelasan & Tata Kimia", maxScore: 10, desc: "Ketepatan penulisan notasi reaksi kimia dan kelancaran alur berpikir ilmiah." },
        ],
      },
      {
        prompt: "Bandingkan keunggulan dan kelemahan antara metode Proteksi Katodik Arus Terpasang (Impressed Current Cathodic Protection / ICCP) dengan Sistem Anoda Korban konvensional untuk perawatan struktur dermaga berumur pakai lebih dari 30 tahun!",
        referenceAnswer: "Sistem Anoda Korban: Keunggulan: Mandiri tanpa suplai listrik luar, instalasi mudah, andal untuk komponen terisolasi. Kelemahan: Massa anoda cepat habis terkorosi sehingga perlu penggantian berkala mahal, menambah beban massa struktur, efektivitas terbatas pada resistivitas air tinggi. Sistem ICCP: Keunggulan: Potensial proteksi dapat dikontrol dan dimonitor secara real-time via rectifier, anoda inert (misal MMO Titanium) berumur pakai sangat panjang (>25-30 tahun), efisien untuk area permukaan baja masif. Kelemahan: Membutuhkan sumber listrik kontinu, risiko over-protection yang memicu perapuhan hidrogen (hydrogen embrittlement) pada baja mutu tinggi, dan biaya instalasi awal lebih besar.",
        maxScore: 50,
        expectedKeywords: ["ICCP Arus Terpasang", "Rectifier arus DC", "Anoda MMO Titanium", "Umur pakai 30 tahun", "Hydrogen embrittlement"],
        rubric: [
          { name: "Komparasi Daya Tahan & Siklus Hidup", maxScore: 15, desc: "Ketajaman perbandingan umur ekonomis anoda terpasang vs anoda habis pakai." },
          { name: "Kebutuhan Daya Listrik & Pengendalian Arus", maxScore: 15, desc: "Analisis peran rectifier transformer dan ketergantungan sumber energi kontinu." },
          { name: "Analisis Risiko Kegagalan Teknis", maxScore: 10, desc: "Penjelasan fenomena over-protection dan kerapuhan hidrogen pada baja." },
          { name: "Rekomendasi Rekayasa Maritim", maxScore: 10, desc: "Kesimpulan logis pemilihan metode untuk infrastruktur strategis jangka panjang." },
        ],
      },
    ],
  },
  {
    ci: 4,
    title: "Pemodelan Matematika Terapan: Optimasi Laba & Lintasan Parabola",
    code: "MTKFUNG01",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 60,
    dueDate: new Date(Date.now() + 8 * 86400000),
    instructions: "Gunakan konsep fungsi kuadrat, titik ekstrem, dan tafsiran diskriminan untuk memecahkan persoalan dunia nyata berikut.",
    questions: [
      {
        prompt: "Koperasi siswa memproduksi kue brownies dengan fungsi biaya total harian C(x) = 2x² - 60x + 800 (dalam ribu rupiah) untuk memproduksi x loyang. Setiap loyang kue dijual dengan harga p(x) = 140 - x (dalam ribu rupiah). Bentuklah fungsi keuntungan π(x), tentukan jumlah loyang yang harus diproduksi agar keuntungan mencapai titik maksimum, dan hitung nilai keuntungan maksimum tersebut!",
        referenceAnswer: "Pendapatan total R(x) = x * p(x) = x(140 - x) = 140x - x². Keuntungan π(x) = R(x) - C(x) = (140x - x²) - (2x² - 60x + 800) = -3x² + 200x - 800. Karena koefisien a = -3 < 0, kurva membuka ke bawah sehingga memiliki nilai maksimum di titik puncak. Sumbu simetri x_opt = -b / (2a) = -200 / (2 * -3) = 200 / 6 ≈ 33,33 loyang. Karena produksi bilangan bulat, uji x = 33 dan x = 34. Untuk x = 33: π(33) = -3(1089) + 200(33) - 800 = -3267 + 6600 - 800 = 2.533 ribu rupiah (Rp 2.533.000). Untuk x = 34: π(34) = -3(1156) + 200(34) - 800 = -3468 + 6800 - 800 = 2.532 ribu rupiah. Jadi produksi optimal adalah 33 loyang dengan keuntungan maksimal Rp 2.533.000 per hari.",
        maxScore: 50,
        expectedKeywords: ["Fungsi pendapatan R(x)", "Fungsi laba π(x)", "Titik puncak x = -b/(2a)", "Keuntungan maksimum", "Diskritisasi bilangan bulat"],
        rubric: [
          { name: "Formulasi Aljabar Fungsi Keuntungan", maxScore: 15, desc: "Akurasi penyusunan fungsi π(x) dari pengurangan pendapatan dan biaya produksi." },
          { name: "Penentuan Titik Ekstrem Parabola", maxScore: 15, desc: "Ketepatan rumus absis puncak dan penalaran koefisien kurva parabola a < 0." },
          { name: "Kalkulasi Nilai Maksimum & Pembulatan Realistis", maxScore: 10, desc: "Akurasi perhitungan laba maksimal dan pengujian nilai diskret produksi." },
          { name: "Interpretasi Kontekstual Finansial", maxScore: 10, desc: "Penyajian kesimpulan dalam konteks operasional bisnis koperasi sekolah." },
        ],
      },
      {
        prompt: "Sebuah roket air diluncurkan dari permukaan tanah dengan persamaan lintasan ketinggian h(t) = -5t² + 40t (h dalam meter, t dalam detik). Analisislah makna geometris dan fisik dari nilai diskriminan D = b² - 4ac lintasan tersebut, tentukan ketinggian maksimum roket, dan waktu saat roket menyentuh tanah kembali!",
        referenceAnswer: "Persamaan h(t) = -5t² + 40t memiliki a = -5, b = 40, c = 0. Diskriminan D = 40² - 4(-5)(0) = 1600 > 0. Makna geometris: D > 0 menunjukkan grafik memotong sumbu-t (permukaan tanah) pada dua titik berlainan. Makna fisik: roket berada di permukaan tanah pada dua waktu berbeda, yaitu saat peluncuran t = 0 dan saat mendarat kembali. Ketinggian maksimum terjadi saat t_puncak = -b / (2a) = -40 / (2 * -5) = 4 detik. Ketinggian maksimum h_max = h(4) = -5(16) + 40(4) = -80 + 160 = 80 meter. Waktu mendarat kembali: h(t) = 0 -> -5t(t - 8) = 0 -> t = 8 detik.",
        maxScore: 50,
        expectedKeywords: ["Diskriminan D > 0", "Dua titik potong sumbu-t", "Ketinggian maksimum h_max = 80 meter", "Waktu terbang 8 detik", "Simetri gerak parabola"],
        rubric: [
          { name: "Analisis Diskriminan & Tafsiran Fisik", maxScore: 15, desc: "Korelasi matematis D > 0 dengan fase tinggal landas dan pendaratan." },
          { name: "Perhitungan Waktu dan Ketinggian Puncak", maxScore: 15, desc: "Akurasi t_puncak = 4 dtk dan capaian ketinggian tertinggi 80 m." },
          { name: "Penentuan Waktu Kontak Tanah Kembali", maxScore: 10, desc: "Ketepatan pemfaktoran akar persamaan kuadrat h(t) = 0." },
          { name: "Sistematika Langkah Matematika", maxScore: 10, desc: "Kerapian langkah pengerjaan berurutan dari rumus ke pembuktian." },
        ],
      },
    ],
  },
  {
    ci: 5,
    title: "Esai Historiografi: Politik Etis & Dinamika Ruang Publik Kebangsaan",
    code: "SEJNAS026",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 60,
    dueDate: new Date(Date.now() + 4 * 86400000),
    instructions: "Jelaskan transformasi sosiopolitik Hindia Belanda awal abad ke-20 dengan penalaran sejarah kritis (historical thinking).",
    questions: [
      {
        prompt: "Politik Etis (1901) dicanangkan oleh Ratu Wilhelmina dengan trilogi: Irigasi, Transmigrasi, dan Edukasi. Analisislah bagaimana pilar Edukasi yang semula ditujukan untuk mencetak tenaga administrasi kolonial murah justru berbalik menjadi 'senjata makan tuan' bagi pemerintah kolonial Belanda!",
        referenceAnswer: "Tujuan awal kolonial mendirikan sekolah (seperti STOVIA, OSVIA, Kweekschool) adalah menyediakan tenaga birokrasi dan medis rendahan berbiaya murah untuk menunjang eksploitasi ekonomi. Namun, transfer ilmu pengetahuan Barat, pemikiran rasional, ide kemerdekaan (Revolusi Prancis), dan nasionalisme justru membukakan mata kaum terpelajar pribumi. Mereka menyadari adanya diskriminasi rasial terstruktur dan ketidakadilan kolonialisme. Golongan elit terpelajar inilah yang bertransformasi menjadi pelopor pergerakan nasional dengan mendirikan organisasi modern Budi Utomo (1908), Sarekat Islam (1912), hingga Indische Partij (1912).",
        maxScore: 50,
        expectedKeywords: ["Trilogi Politik Etis", "Tenaga administrasi murah", "STOVIA & Elit Terpelajar", "Kesadaran nasionalisme", "Organisasi modern Budi Utomo"],
        rubric: [
          { name: "Kontekstualisasi Motif Kebijakan Kolonial", maxScore: 15, desc: "Uraian motif ekonomi pragmatis di balik pendirian sekolah pribumi." },
          { name: "Analisis 'Senjata Makan Tuan' (Unintended Impact)", maxScore: 15, desc: "Penjelasan kebangkitan kesadaran kritis kaum muda terdidik bumiputra." },
          { name: "Korelasi Lahirnya Organisasi Pergerakan", maxScore: 10, desc: "Penyebutan peran alumni STOVIA dan transisi ke perlawanan terorganisasi." },
          { name: "Perspektif Historiografi Kritis", maxScore: 10, desc: "Keobjektifan sudut pandang sejarah dan penggunaan rujukan historis yang valid." },
        ],
      },
      {
        prompt: "Bagaimana surat kabar 'Medan Prijaji' (1907) asuhan Tirto Adhi Soerjo mengubah fungsi pers di Hindia Belanda dari sekadar warta perniagaan menjadi instrumen advokasi hukum dan emansipasi sosial bangsa terjajah?",
        referenceAnswer: "Sebelum Medan Prijaji, pers dikuasai pemilik modal Eropa dan Tionghoa yang berorientasi iklan niaga. Tirto Adhi Soerjo merintis Medan Prijaji sebagai surat kabar pertama yang modal, pengelola, redaksi, dan pembacanya adalah bumiputra (pribumi). Tirto tidak hanya memberitakan peristiwa, melainkan memberikan bantuan hukum cuma-cuma bagi rakyat jelata yang tertindas oleh sewenang-wenang pejabat pamong praja atau penguasa perkebunan Belanda. Melalui bahasa Melayu yang egaliter, Medan Prijaji membangun solidaritas nasional dan menyadarkan hak-hak asasi kaum tertindas.",
        maxScore: 50,
        expectedKeywords: ["Tirto Adhi Soerjo", "Medan Prijaji 1907", "Pers pergerakan pribumi", "Advokasi hukum rakyat tertindas", "Ruang publik bumiputra"],
        rubric: [
          { name: "Peran Pelopor Tirto Adhi Soerjo", maxScore: 15, desc: "Ketepatan merefleksikan posisi Tirto sebagai bapak pers nasional." },
          { name: "Transformasi Fungsi Pers sebagai Alat Advokasi", maxScore: 15, desc: "Analisis penyediaan layanan hukum dan pembelaan hak rakyat kecil." },
          { name: "Dampak terhadap Kesadaran Komunal Bangsa", maxScore: 10, desc: "Uraian peranan bahasa Melayu dan solidaritas kebangsaan." },
          { name: "Artikulasi Narasi Sejarah", maxScore: 10, desc: "Kelancaran bahasa naratif sejarah yang inspiratif dan berbobot." },
        ],
      },
    ],
  },
  {
    ci: 6,
    title: "Analisis Kebijakan Moneter: Transmisi BI-Rate terhadap Daya Beli",
    code: "EKOINFLASI",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 60,
    dueDate: new Date(Date.now() + 5 * 86400000),
    instructions: "Jelaskan mekanisme kebijakan moneter dan stabilitas nilai tukar dengan menerapkan kerangka berpikir makroekonomi terpadu.",
    questions: [
      {
        prompt: "Ketika inflasi meningkat akibat kenaikan harga komoditas global, Bank Indonesia menaikkan suku bunga acuan (BI-Rate). Analisislah jalur transmisi suku bunga terhadap konsumsi masyarakat, suku bunga kredit perbankan, dan bagaimana kebijakan ini memulihkan stabilitas harga tanpa mematikan sektor riil!",
        referenceAnswer: "Kenaikan BI-Rate mentransmisikan efek ke pasar uang antarbank (PUAB), yang mendorong perbankan menaikkan suku bunga deposito dan kredit. Kenaikan suku bunga deposito menstimulasi masyarakat untuk menabung (opportunity cost konsumsi meningkat), sehingga menahan laju permintaan agregat (demand-pull). Di sisi kredit, biaya pinjaman yang lebih tinggi memperlambat ekspansi kredit konsumsi dan investasi. Penurunan permintaan agregat ini meredam tekanan inflasi menuju target sasaran BI. Agar tidak mematikan sektor riil, BI mengombinasikan kebijakan moneter kontraktif ini dengan kebijakan makroprudensial akomodatif, seperti pelonggaran rasio LTV/FTV dan insentif likuiditas makroprudensial untuk kredit sektor prioritas (UMKM dan hilirisasi).",
        maxScore: 50,
        expectedKeywords: ["BI-Rate", "Transmisi suku bunga kredit", "Permintaan agregat (Demand-pull)", "Insentif makroprudensial", "Stabilitas inflasi"],
        rubric: [
          { name: "Uraian Mekanisme Jalur Transmisi Moneter", maxScore: 15, desc: "Kejelasan rantai transmisi dari BI-rate ke perbankan dan perilaku menabung masyarakat." },
          { name: "Pengaruh terhadap Permintaan Agregat", maxScore: 15, desc: "Analisis penekanan inflasi melalui perlambatan laju konsumsi dan kredit." },
          { name: "Kebijakan Bauran (Policy Mix) Makroprudensial", maxScore: 10, desc: "Penjelasan penyelarasan moneter ketat dengan pelonggaran kredit sektor produktif." },
          { name: "Ketepatan Konseptual Makroekonomi", maxScore: 10, desc: "Penerapan istilah moneter dan kestabilan ekonomi secara tepat." },
        ],
      },
      {
        prompt: "Mengapa fenomena inflasi harga pangan bergejolak (volatile food) berdampak disproporsional lebih berat pada masyarakat berpenghasilan rendah dibandingkan kelompok menengah-atas? Kaitkan dengan konsep Hukum Engel!",
        referenceAnswer: "Hukum Engel menyatakan bahwa semakin rendah tingkat pendapatan suatu rumah tangga, semakin besar proporsi pengeluarannya yang dialokasikan untuk kebutuhan pangan pokok. Pada desil masyarakat berpendapatan rendah, porsi belanja pangan mencapai 60-70% dari total pengeluaran. Ketika harga komoditas pangan pokok (beras, minyak, cabai) melonjak, daya beli mereka tergerus drastis karena mereka tidak memiliki fleksibilitas untuk mengorbankan belanja sekunder. Sebaliknya, pada kelompok menengah-atas, proporsi pangan hanya sekitar 15-25% dari pengeluaran, sehingga mereka memiliki bantalan finansial yang jauh lebih kuat untuk menyerap lonjakan harga.",
        maxScore: 50,
        expectedKeywords: ["Hukum Engel", "Proporsi pengeluaran pangan", "Masyarakat desil bawah", "Daya beli tergerus", "Volatile food"],
        rubric: [
          { name: "Penerapan Teori Hukum Engel", maxScore: 15, desc: "Ketepatan menjelaskan persentase belanja pangan terhadap tingkat pendapatan." },
          { name: "Analisis Dampak Disproporsional", maxScore: 15, desc: "Kekuatan argumen mengapa kelompok miskin paling rentan terhadap guncangan harga." },
          { name: "Implikasi Kesejahteraan Sosial", maxScore: 10, desc: "Uraian erosi daya beli dan ancaman kerentanan gizi rumah tangga." },
          { name: "Kejelasan Komunikasi Tulisan", maxScore: 10, desc: "Penyusunan alur analisis ekonomi yang padat fakta dan lugas." },
        ],
      },
    ],
  },
  {
    ci: 7,
    title: "Kajian Sosiologis: Ruang Gema Algoritma & Polarisasi Sosial Remaja",
    code: "SOSSTRA08",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 60,
    dueDate: new Date(Date.now() + 5 * 86400000),
    instructions: "Gunakan teori struktur sosial, interaksi simbolik, dan integrasi kelompok untuk menganalisis fenomena interaksi di media digital.",
    questions: [
      {
        prompt: "Algoritma platform media sosial (seperti TikTok dan X) dirancang memaksimalkan 'engagement' dengan menyajikan konten yang memvalidasi bias pengguna. Analisislah bagaimana fenomena ruang gema (echo chamber) dan gelembung filter (filter bubble) memperkuat sentimen 'in-group' dan menumbuhkan prasangka destruktif terhadap 'out-group' di kalangan pelajar SMA!",
        referenceAnswer: "Kurasi algoritma bekerja berdasarkan preferensi kognitif pengguna, menciptakan filter bubble di mana pengguna hanya terpapar opini sehaluan. Hal ini memicu fenomena echo chamber: keyakinan yang ada digaungkan berulang kali sehingga dianggap sebagai kebenaran mutlak. Secara sosiologis, dinamika ini mempertebal batasan 'in-group' (kelompok kita yang benar) dan mendeligitimasi 'out-group' (kelompok luar yang salah atau jahat). Konfirmasi bias yang terakumulasi melahirkan stereotip negatif, menurunkan empati sosial, dan memicu polarisasi opini antarsiswa yang dapat berujung pada perundungan siber (cyberbullying) dan segregasi pertemanan di sekolah nyata.",
        maxScore: 50,
        expectedKeywords: ["Echo chamber", "Filter bubble", "In-group vs out-group", "Konfirmasi bias", "Polarisasi sosial"],
        rubric: [
          { name: "Analisis Mekanisme Filter Bubble Digital", maxScore: 15, desc: "Penjelasan cara kerja kurasi konten dalam menyaring sudut pandang alternatif." },
          { name: "Dinamika In-Group dan Out-Group", maxScore: 15, desc: "Penerapan konsep identitas kelompok dan tumbuhnya prasangka antarsiswa." },
          { name: "Korelasi Dunia Maya ke Relasi Sosial Nyata", maxScore: 10, desc: "Pengaitan polarisasi digital dengan segregasi interaksi sosial di sekolah." },
          { name: "Kekayaan Rujukan Teori Sosiologi", maxScore: 10, desc: "Penggunaan istilah interaksi sosial dan kohesi kelompok secara tepat." },
        ],
      },
      {
        prompt: "Ajukan dua strategi intervensi sosial yang realistis berbasis sekolah untuk merekatkan kohesi sosial dan memulihkan modal sosial (social capital) di antara kelompok pelajar yang terpolarisasi akibat perbedaan pilihan atau subkultur digital!",
        referenceAnswer: "1) Program Kolaborasi Lintas Kelompok (Cooperative Learning & Shared Project): Mengelompokkan siswa dengan latar belakang pandangan berbeda ke dalam proyek aksi sosial bersama (misal pengabdian masyarakat atau pameran karya). Menurut Hipotesis Kontak Allport, kerja sama menuju tujuan bersama dengan status setara mampu meruntuhkan prasangka interpersonal; 2) Kurikulum Literasi Kritis & Debat Perspektif Terbalik (Perspective-Taking Debate): Pelatihan kurikulum di mana siswa diwajibkan menyusun argumen dari sudut pandang lawan bicara, melatih empati kognitif, dan menanamkan pemahaman bahwa realitas sosial memiliki beragam sudut pandang yang sah.",
        maxScore: 50,
        expectedKeywords: ["Modal sosial (Social capital)", "Hipotesis Kontak Allport", "Proyek kolaboratif lintas kelompok", "Perspective-taking", "Empati kognitif"],
        rubric: [
          { name: "Relevansi Teori Integrasi Sosial", maxScore: 15, desc: "Landasan sosiologis yang kokoh dalam merancang usulan intervensi." },
          { name: "Aplikabilitas di Lingkungan Sekolah", maxScore: 15, desc: "Tingkat kepraktisan penerapan program oleh guru bimbingan konseling/sekolah." },
          { name: "Fokus pada Pemulihan Modal Sosial", maxScore: 10, desc: "Kejelasan dampak program terhadap pembentukan rasa saling percaya (trust)." },
          { name: "Kerapian Solusi & Daya Persuasi", maxScore: 10, desc: "Penyusunan solusi yang sistematis, inspiratif, dan terukur." },
        ],
      },
    ],
  },
  {
    ci: 8,
    title: "Studi Mitigasi Vulkanik: Penataan Ruang & Sistem Peringatan Dini",
    code: "GEOATM09",
    status: "active" as const,
    pub: "unpublished" as const,
    dur: 60,
    dueDate: new Date(Date.now() + 6 * 86400000),
    instructions: "Evaluasi kerentanan wilayah dan efektivitas jalur evakuasi bencana vulkanologi dengan pendekatan keruangan spasial.",
    questions: [
      {
        prompt: "Di kawasan lereng Gunung Merapi, wilayah Kawasan Rawan Bencana (KRB) III memiliki ancaman luncuran awan panas (wedhus gembel) yang sangat mematikan. Namun, masyarakat lokal enggan direlokasi permanen ke dataran rendah. Analisislah paradoks spasial ini ditinjau dari faktor kesuburan tanah abu vulkanik, ikatan kultural kearifan lokal, dan strategi penataan ruang adaptif!",
        referenceAnswer: "Paradoks spasial di lereng Merapi terjadi akibat tarik-menarik antara bahaya fisik (hazard) dan daya tarik ekonomi-budaya: 1) Erupsi masa lampau menghasilkan abu vulkanik kaya unsur hara (P, K, Ca, Mg) yang membuat tanah andosol sangat subur untuk komoditas hortikultura bernilai tinggi; 2) Ikatan sosiokultural dan spiritual yang mendalam terhadap tanah leluhur melahirkan kearifan lokal membaca tanda-tanda alam; 3) Strategi adaptif: Alih-alih relokasi paksa yang memicu resistensi, penataan ruang berbasis mitigasi living in harmony with disaster dapat diterapkan: zonasi ruang terbuka hijau di KRB III, pembangunan bungker/shelter darurat tahan panas, larangan hunian permanen baru, serta edukasi rute evakuasi berbasis komunitas (desa paseduluran/sister village).",
        maxScore: 50,
        expectedKeywords: ["Kawasan Rawan Bencana (KRB) III", "Tanah andosol subur", "Kearifan lokal Merapi", "Sister village / Desa bersaudara", "Mitigasi berbasis adaptasi"],
        rubric: [
          { name: "Analisis Faktor Pedosfer & Pertanian", maxScore: 15, desc: "Penjelasan proses pelapukan material vulkanik menjadi tanah subur bernilai ekonomi." },
          { name: "Penilaian Dimensi Kultural & Perilaku", maxScore: 15, desc: "Pemahaman mengenai kelekatan warga lokal dengan ruang hidup tradisional." },
          { name: "Desain Penataan Ruang Berkelanjutan", maxScore: 10, desc: "Inovasi kebijakan tata ruang zonasi mitigasi dan konsep desa bersaudara." },
          { name: "Pendekatan Spasial Geografi", maxScore: 10, desc: "Penerapan konsep geografi (keterkaitan keruangan, nilai kegunaan) secara tepat." },
        ],
      },
      {
        prompt: "Rancanglah alur Sistem Peringatan Dini (Early Warning System / EWS) inklusif saat status gunung api meningkat dari Level III (Siaga) ke Level IV (Awas). Bagaimana sistem tersebut memastikan evakuasi kelompok rentan (lansia, ibu hamil, balita, dan penyandang disabilitas) terlaksana tanpa kepanikan massal?",
        referenceAnswer: "Alur EWS Inklusif: 1) Pemantauan & Diseminasi Multi-Kanal: Data seismograf BPPTKG diintegrasikan ke sirene radio komunitas, SMS broadcast desa, dan kentongan bambu tradisional RT untuk menjamin redundansi informasi; 2) Pendataan Presisi Geospasial: Setiap RT memiliki database spasial lokasi rumah kelompok rentan dengan kode warna darurat; 3) Prioritas Evakuasi Tahap Siaga: Kelompok rentan tidak menunggu status Awas; mereka dievakuasi lebih awal pada status Siaga menggunakan armada transportasi desa yang telah ditunjuk pendamping khususnya; 4) Jalur Evakuasi Khusus & Aksesibel: Rute bebas hambatan menuju shelter pengungsian yang ramah disabilitas (toilet khusus, jalur kursi roda, dan ruang laktasi).",
        maxScore: 50,
        expectedKeywords: ["Early Warning System inklusif", "Status Siaga ke Awas", "Evakuasi dini kelompok rentan", "Redundansi informasi multi-kanal", "Shelter ramah disabilitas"],
        rubric: [
          { name: "Rancangan Arsitektur Peringatan Dini", maxScore: 15, desc: "Integrasi teknologi modern sensor seismik dengan kearifan lokal komunikasi warga." },
          { name: "Protokol Penyelamatan Kelompok Rentan", maxScore: 15, desc: "Ketepatan langkah evakuasi lebih dini sebelum fase kritis letusan tiba." },
          { name: "Kesiapan Infrastruktur Evakuasi", maxScore: 10, desc: "Aksesibilitas shelter pengungsian dan kepastian logistik khusus difabel." },
          { name: "Struktur & Ketegasan Standar Operasional", maxScore: 10, desc: "Penyajian alur kerja manajemen kebencanaan yang operasional dan teruji." },
        ],
      },
    ],
  },
  {
    ci: 9,
    title: "Kritik Seni Pedagogis: Dekonstruksi Seni Rupa Kontemporer",
    code: "SENMOD010",
    status: "draft" as const,
    pub: "unpublished" as const,
    dur: 75,
    dueDate: new Date(Date.now() + 10 * 86400000),
    instructions: "Draf asesmen telaah kritik seni rupa. Guru sedang menyempurnakan indikator rubrik sebelum membuka ujian kepada siswa.",
    questions: [
      {
        prompt: "Pilihlah salah satu karya lukis Affandi atau instalasi Heri Dono, kemudian susunlah ulasan kritik seni secara lengkap menerapkan 4 tahapan formal: Deskripsi, Analisis Formal, Interpretasi Makna, dan Evaluasi Kritis!",
        referenceAnswer: "Kritik harus memuat 4 pilar Edmund Burke Feldman: 1) Deskripsi: Menyebutkan data fisik karya, subjek visual yang tampak tanpa prasangka; 2) Analisis Formal: Membedah relasi unsur rupa (garis ekspresif, warna monokrom/kontras, tekstur plakat cat) dan prinsip penataan (ritme, harmoni, pusat perhatian); 3) Interpretasi: Menafsirkan tema tersembunyi (misal kritik feodalisme, kecemasan manusia modern, ironi politik); 4) Evaluasi: Menilai orisinalitas, signifikansi kultural, dan relevansi pesan karya bagi peradaban masa kini.",
        maxScore: 100,
        expectedKeywords: ["Empat tahapan Feldman", "Deskripsi objektif", "Analisis formal unsur rupa", "Interpretasi metafora", "Evaluasi signifikansi"],
        rubric: [
          { name: "Tahap Deskripsi Visual Karya", maxScore: 25, desc: "Akurasi pencatatan inventaris visual dan data teknis karya seni." },
          { name: "Analisis Formal Prinsip Desain", maxScore: 30, desc: "Ketajaman membedah komposisi garis, warna, ruang, dan irama rupa." },
          { name: "Interpretasi Konseptual Simbolik", maxScore: 25, desc: "Kedalaman mengungkap metafora filosofis dan kritik sosial di balik karya." },
          { name: "Evaluasi Komparatif & Orisinalitas", maxScore: 20, desc: "Objektivitas menimbang bobot kebaruan dan kontribusi artistik karya." },
        ],
      },
    ],
  },
];

// ── Ragam Jawaban Siswa Otentik per Kemampuan ─────────────────────
function generateStudentAnswer(
  qOrder: number,
  classIdx: number,
  tier: "excellent" | "competent" | "developing" | "struggling"
): string {
  if (classIdx === 0) {
    // Biologi
    if (qOrder === 1) {
      if (tier === "excellent") {
        return "Berdasarkan pemahaman biokimia seluler, molekul DCMU mengikat sisi aktif plastokuinon QB pada kompleks Fotosistem II (PS II), sehingga memutus rantai transpor elektron non-siklik ke sitokrom b6f. Dampak molekulernya dapat dibagi menjadi tiga tahap sistemik:\n\n1. Fotolisis Air Terhenti: Karena P680+ yang teroksidasi tidak lagi menerima aliran elektron pengganti, enzim fotolisis air (OEC) berhenti memecah molekul H₂O menjadi 2H+, 2e-, dan 1/2 O₂. Akibatnya, produksi gas oksigen di sel mesofil daun turun drastis hingga nol.\n\n2. Hilangnya Gradien Elektrokimia Proton: Terhentinya aliran elektron membuat pompa proton kompleks sitokrom b6f tidak dapat mentranslokasikan ion H+ dari stroma ke lumen tilakoid. Tanpa adanya perbedaan konsentrasi proton (ΔpH yang tajam), kekuatan gerak proton (proton-motive force) lenyap, sehingga enzim ATP sintase tidak dapat melakukan fosforilasi ADP menjadi ATP.\n\n3. Lumpuhnya Fiksasi CO₂ pada Siklus Calvin: Siklus Calvin di stroma membutuhkan ATP untuk fase fosforilasi dan NADPH untuk fase reduksi 1,3-bifosfogliserat menjadi gliseraldehida 3-fosfat (G3P). Ketiadaan kedua molekul energi tinggi ini menyebabkan siklus Calvin berhenti total, fiksasi karbon terhambat, dan tanaman mati akibat kelaparan karbon (carbon starvation).";
      }
      if (tier === "competent") {
        return "Herbisida DCMU memblokir transfer elektron pada Fotosistem II. Hal ini menyebabkan fotosintesis terganggu parah:\n\nPertama, reaksi pemecahan air (fotolisis) di membran tilakoid terhenti karena elektron tidak bisa mengalir lebih lanjut. Akibatnya pelepasan oksigen berhenti.\n\nKedua, pompa proton ke dalam lumen tilakoid berhenti bekerja, sehingga gradien proton tidak terbentuk. Tanpa gradien proton ini, ATP sintase tidak dapat memproduksi ATP.\n\nKetiga, pembentukan NADPH juga terhambat. Tanpa ATP dan NADPH dari reaksi terang, siklus Calvin di stroma tidak memiliki energi untuk mengubah CO₂ menjadi glukosa, sehingga sintesis karbohidrat terhenti total.";
      }
      if (tier === "developing") {
        return "DCMU menghambat aliran elektron di fotosistem 2. Kalau elektron dihambat, air tidak bisa dipecah menjadi oksigen. Jadi tidak ada oksigen yang dihasilkan.\n\nSelain itu, pembentukan ATP juga terganggu karena ion proton tidak bisa dipompa dengan baik di membran tilakoid. Siklus Calvin yang ada di stroma membutuhkan ATP dan NADPH untuk menghasilkan gula, jadi kalau reaksi terang mati, siklus Calvin juga ikut mati dan tumbuhan tidak bisa makan.";
      }
      return "Herbisida DCMU merusak klorofil di daun sehingga daun tidak bisa menyerap sinar matahari. Air tidak bisa terpecah dan fotosintesis berhenti. Tumbuhan jadi layu karena tidak ada glukosa dan oksigen yang keluar dari stomata daun.";
    } else {
      // Q2 Biologi (CAM)
      if (tier === "excellent") {
        return "Adaptasi tanaman tipe CAM merupakan solusi evolusioner yang luar biasa terhadap cekaman kekeringan di lingkungan gurun (xerofit). Keunggulan adaptasi temporal ini terletak pada pemisahan waktu fiksasi karbon:\n\n1. Fase Malam (Pengambilan CO₂ Tanpa Dehidrasi): Di malam hari, suhu gurun turun drastis dan kelembapan relatif meningkat. Tanaman CAM membuka stomata pada saat ini, sehingga laju transpirasi (penguapan air) sangat rendah. CO₂ yang masuk difiksasi oleh enzim PEP karboksilase—yang memiliki afinitas sangat tinggi terhadap karbon dan tidak berkompetisi dengan oksigen—menjadi asam oksaloasetat, lalu direduksi menjadi asam malat dan disimpan dengan aman di vakuola sel.\n\n2. Fase Siang (Pemanfaatan Energi Cahaya dengan Stomata Tertutup): Pada siang hari yang terik, stomata menutup rapat untuk mencegah kehilangan air secara ekstrem. Asam malat dikeluarkan dari vakuola dan didekarboksilasi melepaskan CO₂ dalam konsentrasi tinggi langsung di sekitar RuBisCO. Kondisi konsentrasi CO₂ internal yang tinggi ini menekan fotorespirasi secara efektif.\n\nDengan strategi ini, tanaman CAM mencapai rasio efisiensi penggunaan air (Water-Use Efficiency) 3-5 kali lebih tinggi dibandingkan tanaman C3 dan C4.";
      }
      if (tier === "competent") {
        return "Tanaman CAM membuka stomata pada malam hari dan menutupnya pada siang hari untuk menghemat air di daerah gurun yang sangat panas.\n\nPada malam hari saat suhu dingin, stomata terbuka untuk mengambil CO₂. Gas ini diubah menjadi asam malat oleh enzim PEP karboksilase dan disimpan di vakuola sel. Pada siang hari saat matahari terik, stomata ditutup rapat agar air tidak menguap. Asam malat dipecah kembali mengeluarkan CO₂ untuk digunakan siklus Calvin bersama enzim RuBisCO dengan bantuan energi cahaya matahari. Hal ini membuat tanaman CAM sangat tahan kekeringan.";
      }
      if (tier === "developing") {
        return "Tanaman CAM seperti kaktus hidup di tempat kering. Kalau mereka buka stomata siang hari, airnya akan cepat habis menguap. Jadi kaktus membuka stomatanya malam hari saat sejuk.\n\nCO₂ disimpan dalam bentuk asam di vakuola. Nanti saat siang hari baru diproses jadi glukosa pakai cahaya matahari. Ini membuat kaktus bisa bertahan hidup tanpa banyak air.";
      }
      return "Tanaman CAM membuka stomata waktu malam supaya tidak kepanasan. Siang hari stomatanya ditutup. CO₂ diambil waktu malam terus disimpan di daun. Cara ini bagus untuk tanaman gurun supaya tidak mati kekeringan.";
    }
  }

  // Generic realistic fallback for other subjects based on tier
  if (tier === "excellent") {
    return "Analisis komprehensif terhadap permasalahan ini menunjukkan keterkaitan erat antara teori dasar dengan fenomena empiris yang diamati. Berdasarkan tinjauan konseptual, variabel-variabel kunci berinteraksi secara sistematis membentuk hubungan kausalitas yang kokoh.\n\nPertama, mekanisme mendasar bekerja dengan menjaga keseimbangan parameter sistem, di mana setiap perubahan pada komponen input secara terukur mempengaruhi output melalui hukum kekekalan dan prinsip optimasi. Kedua, bukti kontekstual membuktikan bahwa penerapan solusi terstruktur mampu memitigasi dampak negatif sekaligus melipatgandakan efisiensi operasional secara berkelanjutan.\n\nDengan demikian, sintesis argumen ini menegaskan pentingnya pemahaman holistik yang memadukan ketepatan metodologis aljabar/ilmiah dengan kepekaan terhadap kondisi lingkungan nyata.";
  }
  if (tier === "competent") {
    return "Topik ini dapat dijelaskan dengan menghubungkan konsep teori yang telah dipelajari dengan contoh konkret di lapangan. Secara umum terdapat dua faktor utama yang menentukan keberhasilan proses ini.\n\nFaktor pertama berkaitan dengan mekanisme dasar yang mengatur jalannya sistem secara teratur. Faktor kedua adalah bagaimana variabel pendukung bekerja sama agar hasil yang diperoleh optimal dan sesuai standar yang diharapkan.\n\nMeskipun terdapat beberapa kendala teknis dalam pelaksanaannya, penerapan metode yang tepat terbukti mampu memberikan hasil yang efektif dan dapat dipertanggungjawabkan secara logis.";
  }
  if (tier === "developing") {
    return "Menurut pemahaman saya di kelas, masalah ini terjadi karena adanya hubungan sebab akibat antar bagian yang saling mempengaruhi. Konsep dasarnya sudah cukup jelas bahwa kita harus memperhatikan faktor utama agar tidak terjadi kesalahan.\n\nKalau salah satu bagian terganggu maka bagian lain juga akan ikut kena dampaknya. Oleh karena itu penting untuk mengikuti petunjuk dan aturan yang ada supaya sistemnya bisa berjalan lancar.";
  }
  return "Penjelasan tentang materi ini adalah mengenai cara kerja sistem yang ada di pelajaran. Kita harus tahu apa saja yang dibutuhkan supaya bisa berjalan dengan baik. Jika ada yang kurang maka hasilnya tidak maksimal.";
}

async function main() {
  console.log("🌱 Menyusun Skenario Nyata ESAINA (10 Kelas × 20 Siswa)…\n");

  await prisma.$executeRawUnsafe("PRAGMA synchronous = OFF;");
  await prisma.$executeRawUnsafe("PRAGMA journal_mode = MEMORY;");

  // Clean
  for (const m of ["gradeHistory","criterionScore","rating","answer","submission","rubricCriterion","question","assessmentRater","assessment","enrollment","class","user"] as const) {
    await (prisma as any)[m].deleteMany();
  }

  const pw = await bcrypt.hash("password", 10);

  // 1. Users
  console.log("  [1/5] Membuat 204 akun pengguna (1 Admin, 3 Guru, 200 Siswa)…");
  const [admin, ...teacherAndStudents] = await prisma.$transaction([
    prisma.user.create({ data: { name: "Administrator Sekolah", email: "admin@example.com", password: pw, role: "admin" } }),
    prisma.user.create({ data: { name: "Dra. Sri Wahyuni, M.Pd.", email: "teacher1@example.com", password: pw, role: "teacher", identifier: "197501012005011001" } }),
    prisma.user.create({ data: { name: "Budi Santoso, S.Pd.", email: "teacher2@example.com", password: pw, role: "teacher", identifier: "198203152008011002" } }),
    prisma.user.create({ data: { name: "Nurul Hidayah, S.Pd.", email: "teacher3@example.com", password: pw, role: "teacher", identifier: "198712202010012003" } }),
    ...STUDENT_NAMES.map((name, i) =>
      prisma.user.create({
        data: {
          name,
          email: i === 0 ? "student1@example.com" : `student${i + 1}@example.com`,
          password: pw, role: "student",
          identifier: `2026${String(1001 + i).padStart(4, "0")}`,
        },
      })
    ),
  ]);

  const teachers = teacherAndStudents.slice(0, 3);
  const students = teacherAndStudents.slice(3);

  // 2. Classes
  console.log("  [2/5] Mendaftarkan 10 kelas mata pelajaran…");
  const classes = await prisma.$transaction(
    CLASS_SPECS.map((d) =>
      prisma.class.create({
        data: { name: d.name, subject: d.subject, grade: d.grade, academicYear: "2026/2027 Ganjil", classCode: d.code, creatorId: teachers[d.ti].id },
      })
    )
  );

  // 3. Enrollments (20 siswa per kelas)
  console.log("  [3/5] Mengelompokkan 200 enrollment siswa (20 siswa per kelas)…");
  const enrollData: { classId: string; studentId: string }[] = [];
  for (let c = 0; c < 10; c++) {
    for (let s = 0; s < 20; s++) {
      enrollData.push({ classId: classes[c].id, studentId: students[c * 20 + s].id });
    }
  }
  await prisma.$transaction(enrollData.map((d) => prisma.enrollment.create({ data: d })));

  // 4. Assessments, Rubrics & Real-world Submissions
  console.log("  [4/5] Membangun asesmen realistis, rubrik bertingkat, dan lembar jawaban siswa…");
  let totalSubs = 0;
  let totalAns = 0;

  for (const aDef of REAL_ASSESSMENTS) {
    const cls = classes[aDef.ci];
    const teacher = teachers[CLASS_SPECS[aDef.ci].ti];

    const assessment = await prisma.assessment.create({
      data: {
        classId: cls.id, creatorId: teacher.id, title: aDef.title, code: aDef.code,
        subject: cls.subject, status: aDef.status, publicationStatus: aDef.pub,
        publishedAt: aDef.pub === "published" ? new Date(Date.now() - 3 * 86400000) : null,
        dueDate: aDef.dueDate, durationMinutes: aDef.dur, raterCount: 1, targetRaters: 1,
        instructions: aDef.instructions,
      },
    });

    await prisma.assessmentRater.create({ data: { assessmentId: assessment.id, raterId: teacher.id } });

    // Questions + Rubrics
    type QRec = {
      question: { id: string; orderNumber: number; prompt: string };
      criteria: { id: string; maxScore: number; name: string }[];
    };
    const qRecs: QRec[] = [];

    for (let qi = 0; qi < aDef.questions.length; qi++) {
      const qd = aDef.questions[qi];
      const question = await prisma.question.create({
        data: {
          assessmentId: assessment.id,
          orderNumber: qi + 1,
          prompt: qd.prompt,
          referenceAnswer: qd.referenceAnswer,
          maxScore: qd.maxScore,
          expectedKeywords: JSON.stringify(qd.expectedKeywords),
        },
      });

      const criteria = await prisma.$transaction(
        qd.rubric.map((r, idx) =>
          prisma.rubricCriterion.create({
            data: {
              questionId: question.id,
              name: r.name,
              weight: Math.round((r.maxScore / qd.maxScore) * 100),
              maxScore: r.maxScore,
              description: r.desc,
              levels: JSON.stringify([
                { score: r.maxScore, label: "Sangat Baik", description: `Menguraikan aspek "${r.name}" secara komprehensif, akurat, dan berbasis data/istilah ilmiah yang tepat.` },
                { score: Math.max(1, Math.round(r.maxScore * 0.75)), label: "Baik", description: `Menjelaskan aspek "${r.name}" dengan benar, namun elaborasi atau rincian pendukung masih dapat ditingkatkan.` },
                { score: Math.max(1, Math.round(r.maxScore * 0.5)), label: "Cukup", description: `Menyebutkan konsep umum "${r.name}" secara garis besar tanpa penalaran mendalam.` },
                { score: 0, label: "Kurang", description: `Aspek "${r.name}" belum dijawab atau terdapat miskonsepsi mendasar.` },
              ]),
            },
          })
        )
      );
      qRecs.push({ question, criteria });
    }

    // Skip submissions for draft assessment
    if (aDef.status === "draft") {
      console.log(`    ✓ ${cls.name}: [DRAFT] ${aDef.title}`);
      continue;
    }

    // Submissions for 20 students in this class
    const startIdx = aDef.ci * 20;
    const classStudents = students.slice(startIdx, startIdx + 20);

    for (let si = 0; si < classStudents.length; si++) {
      const student = classStudents[si];
      const isCompletedAss = aDef.status === "completed";

      // Submission status realism
      const isSubmitted = isCompletedAss ? true : si < 16;
      const isGraded = isCompletedAss ? true : si < 11;
      const isFinal = isCompletedAss ? true : si < 7;

      const submission = await prisma.submission.create({
        data: {
          assessmentId: assessment.id,
          studentId: student.id,
          statusWork: isSubmitted ? "submitted" : si < 19 ? "draft" : "not_started",
          statusGrading: isFinal ? "final" : isGraded ? "draft_graded" : "ungraded",
          submittedAt: isSubmitted ? new Date(Date.now() - (si + 1) * 3600000 * 2) : null,
          startedAt: isSubmitted || si < 19 ? new Date(Date.now() - (si + 2) * 3600000 * 2) : null,
          teacherGeneralNotes: isFinal
            ? `Pekerjaan dievaluasi dengan cermat. Nilai akhir mencerminkan pemahaman konseptual dan ketajaman analisis siswa ${student.name}.`
            : "",
        },
      });
      totalSubs++;

      if (si === 19 && !isCompletedAss) continue; // 1 siswa not_started

      // Ability tier for realistic variety
      const tier: "excellent" | "competent" | "developing" | "struggling" =
        si % 4 === 0 ? "excellent" : si % 4 === 1 ? "competent" : si % 4 === 2 ? "developing" : "struggling";

      let overallScore = 0;
      const critScoresToBatch: any[] = [];
      const ratingsToBatch: any[] = [];
      const historyToBatch: any[] = [];

      for (const { question, criteria } of qRecs) {
        const studentText = generateStudentAnswer(question.orderNumber, aDef.ci, tier);
        const words = studentText.trim().split(/\s+/).filter(Boolean).length;

        // Calculate rubric scores based on tier
        const scores: Record<string, number> = {};
        let qTotal = 0;

        for (const crit of criteria) {
          const ratio =
            tier === "excellent"
              ? 0.88 + (pseudo(`${student.id}${crit.id}a`, 12) / 100)
              : tier === "competent"
              ? 0.72 + (pseudo(`${student.id}${crit.id}b`, 14) / 100)
              : tier === "developing"
              ? 0.50 + (pseudo(`${student.id}${crit.id}c`, 18) / 100)
              : 0.28 + (pseudo(`${student.id}${crit.id}d`, 20) / 100);

          const val = isGraded ? Math.min(crit.maxScore, Math.max(1, Math.round(crit.maxScore * ratio))) : 0;
          scores[crit.id] = val;
          qTotal += val;
        }
        overallScore += qTotal;

        // Realistic AI Recommendation
        const aiSuggestedScores: Record<string, number> = {};
        for (const crit of criteria) {
          aiSuggestedScores[crit.id] = Math.min(crit.maxScore, Math.max(1, Math.round(crit.maxScore * (tier === "excellent" ? 0.9 : tier === "competent" ? 0.75 : tier === "developing" ? 0.55 : 0.35))));
        }

        const aiExplanation = {
          overallAssessment:
            tier === "excellent"
              ? "Jawaban sangat memuaskan. Argumen analitis diuraikan secara runtut dengan kosakata ilmiah yang presisi dan mengaitkan konsep utama dengan baik."
              : tier === "competent"
              ? "Konsep dasar sudah dikuasai secara baik dan tepat sasaran. Diperlukan sedikit penguatan pada rincian mekanisme pendukung."
              : tier === "developing"
              ? "Siswa memahami gagasan pokok secara umum, namun penjelasan masih bersifat permukaan dan memerlukan elaborasi berbasis data ilmiah."
              : "Pemahaman materi masih terbatas dan terdapat kecenderungan miskonsepsi. Disarankan mendapatkan bimbingan remedial konsep dasar.",
          suggestedScores: aiSuggestedScores,
          keyEvidenceQuotes: [
            {
              text: studentText.slice(0, Math.min(120, studentText.length)),
              criterionId: criteria[0].id,
              sentiment: tier === "excellent" || tier === "competent" ? "strength" : "improvement",
              note: tier === "excellent" || tier === "competent" ? "Identifikasi premis utama tepat dan berbasis logika ilmiah." : "Pernyataan pembuka masih terlalu umum dan kurang fokus.",
            },
          ],
          improvementTips: [
            "Perkuat hubungan sebab-akibat dengan istilah teknis standar kurikulum.",
            "Berikan analogi atau data kuantitatif pendukung untuk mempertegas kesimpulan.",
          ],
        };

        const teacherFeedback =
          tier === "excellent"
            ? "Uraian Anda sangat memuaskan, terstruktur, dan menunjukkan pemikiran analitis tingkat tinggi. Pertahankan konsistensi ini!"
            : tier === "competent"
            ? "Penjelasan konsep sudah tepat dan runtut. Tambahkan sedikit elaborasi mengenai implikasi praktisnya untuk meraih nilai sempurna."
            : tier === "developing"
            ? "Gagasan dasar sudah terlihat, namun penjabaran masih terlalu singkat. Coba gunakan contoh nyata untuk memperkuat argumen Anda."
            : "Perhatikan kembali buku panduan materi. Fokuslah pada alur sebab-akibat utama sebelum menyusun kesimpulan.";

        const answer = await prisma.answer.create({
          data: {
            submissionId: submission.id,
            questionId: question.id,
            studentAnswer: studentText,
            charCount: studentText.length,
            wordCount: words,
            indobertScore: isGraded ? Math.min(100, Math.round((qTotal / question.orderNumber) * 2)) : null,
            indobertStatus: isGraded ? "available" : "pending",
            finalScore: isFinal ? qTotal : null,
            finalScoreBy: isFinal ? teacher.id : null,
            finalScoreAt: isFinal ? new Date(Date.now() - (si + 1) * 3600000) : null,
            status: isFinal ? "completed" : isGraded ? "ready_for_review" : "waiting_raters",
            teacherFeedback: isGraded ? teacherFeedback : "",
            aiExplanation: JSON.stringify(aiExplanation),
            isAiApplied: isFinal && si % 2 === 0,
          },
        });
        totalAns++;

        if (isGraded) {
          for (const [cId, sc] of Object.entries(scores)) {
            critScoresToBatch.push(prisma.criterionScore.create({ data: { answerId: answer.id, criterionId: cId, score: sc } }));
          }
          ratingsToBatch.push(prisma.rating.create({ data: { answerId: answer.id, raterId: teacher.id, score: qTotal } }));
          historyToBatch.push(
            prisma.gradeHistory.create({
              data: {
                submissionId: submission.id,
                questionId: question.id,
                raterId: teacher.id,
                action: isFinal ? "finalized" : "score_adjustment",
                actionLabel: isFinal ? "Penilaian difinalisasi" : "Draf nilai diperbarui",
                newScore: qTotal,
                note: `Evaluasi soal ${question.orderNumber} oleh ${teacher.name}.`,
              },
            })
          );
        }
      }

      if (critScoresToBatch.length) await prisma.$transaction(critScoresToBatch);
      if (ratingsToBatch.length) await prisma.$transaction(ratingsToBatch);
      if (historyToBatch.length) await prisma.$transaction(historyToBatch);

      if (isFinal) {
        await prisma.submission.update({
          where: { id: submission.id },
          data: {
            overallFinalScore: overallScore,
            publishedScore: isCompletedAss ? overallScore : null,
            finalizedBy: teacher.id,
            finalizedAt: new Date(Date.now() - (si + 1) * 3600000),
          },
        });
      }
    }

    console.log(`    ✓ ${cls.name}: [${aDef.status.toUpperCase()}] ${aDef.title}`);
  }

  // 5. Restore sqlite safe mode
  await prisma.$executeRawUnsafe("PRAGMA journal_mode = WAL;");
  await prisma.$executeRawUnsafe("PRAGMA synchronous = NORMAL;");

  console.log("\n✅ Seluruh Skenario Nyata Asesmen Berhasil Disuntikkan!");
  console.log("-------------------------------------------------------");
  console.log(`• Total Pengguna     : ${1 + 3 + students.length} (1 Admin, 3 Guru, 200 Siswa)`);
  console.log(`• Total Kelas        : ${classes.length} Kelas`);
  console.log(`• Total Asesmen      : ${REAL_ASSESSMENTS.length} Asesmen Lengkap`);
  console.log(`• Total Submissions  : ${totalSubs} Lembar Jawaban`);
  console.log(`• Total Jawaban Esai : ${totalAns} Esai Otentik dengan Rubrik & AI`);
  console.log("-------------------------------------------------------\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
