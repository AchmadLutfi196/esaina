# ESAINA — Explainable Essay Assessment Platform

Platform web penilaian esai berbasis AI yang dapat dijelaskan (*Explainable AI*): AI menyiapkan draf skor, kriteria rubrik, kutipan evidensi jawaban (*exact quotes*), dan umpan balik (*feedback*), di mana **guru** memegang kendali penuh atas keputusan akhir dan siswa hanya melihat hasil asesmen yang telah disahkan dan diterbitkan secara resmi.

Dikembangkan oleh **Tim Kopsudomar** (Jauza — UI/UX, Lutfi & Abdul — Full-Stack) untuk **INCEPTION 2026**.

## Fitur Utama
- **Bleu Océan Glassmorphism UI**: Antarmuka modern, elegan, responsif, dan ramah pengguna dengan 16 layar desain autentik serta sistem ikon `lucide-react`.
- **Alur Penilaian Guru Tunggal + IndoBERT AI**: Rekomendasi skor per kriteria rubrik dengan ekstraksi bukti teks esai siswa.
- **Manajemen Kelas & Asesmen**: Manajemen kelas dengan kode gabung unik, pembuatan asesmen Kurikulum Merdeka, dan rubrik analitik.
- **Pengerjaan Esai Siswa**: Lembar kerja digital dengan penyimpanan draf otomatis (*autosave debounce*) dan transaksi pengumpulan (*idempotent submission*).
- **Pengesahan & Publikasi Nilai**: Validasi penilaian server, pengesahan nilai bertahap, dan publikasi nilai terproteksi.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Radix UI + Lucide React
- **Database & ORM**: PostgreSQL / Supabase + SQLite Dev + Prisma 7
- **Authentication**: NextAuth.js Credentials & Role Guards (Teacher & Student)
- **State Management**: TanStack React Query

## Menjalankan Aplikasi

1. Clone repositori dan install dependensi:
```bash
npm install
# atau
pnpm install
```

2. Konfigurasi environment:
Salin `.env.example` ke `.env.local` dan sesuaikan variabel koneksi database dan kredensial AI.

3. Generate Prisma client & migrasi database:
```bash
npm run db:generate
# atau npx prisma generate
```

4. Jalankan development server:
```bash
npm run dev
```

Buka `http://localhost:3000` di peramban web.
