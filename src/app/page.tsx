import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PROOF = [
  { value: "Per kriteria", label: "Saran skor mengikuti rubrik, bukan angka tunggal" },
  { value: "Kutipan persis", label: "Alasan selalu merujuk teks jawaban siswa" },
  { value: "Guru yang sahkan", label: "AI tidak pernah menerbitkan apa pun sendiri" },
];

const STEPS = [
  {
    num: "01",
    title: "Guru menyiapkan soal dan rubrik",
    body: "Kelas dengan kode bergabung. Tiap soal punya jawaban acuan dan kriteria penilaian; struktur terkunci saat asesmen dibuka agar semua siswa mengerjakan tugas yang sama.",
  },
  {
    num: "02",
    title: "Siswa menulis, AI menyusun draf",
    body: "Jawaban tersimpan otomatis dan terkunci saat dikumpulkan. Untuk setiap kriteria, model mengusulkan skor beserta alasan, kutipan persis dari jawaban, dan usulan feedback.",
  },
  {
    num: "03",
    title: "Guru mengoreksi, mengesahkan, menerbitkan",
    body: "Saran bisa dipakai, disunting, atau ditolak. Nilai hanya final setelah guru mengesahkannya, dan siswa melihat hasil setelah guru menerbitkannya.",
  },
];

const GUARANTEES = [
  "Otorisasi diperiksa di server pada setiap route — sesi, peran, kepemilikan kelas.",
  "Keluaran AI divalidasi ulang di server: ID, rentang rubrik, dan kecocokan kutipan. Saran yang gagal tidak bisa diterapkan.",
  "Setiap perubahan nilai tercatat; revisi membuat versi baru tanpa mengubah hasil yang sudah terbit.",
  "Jawaban dikirim ke model sebagai kode anonim; instruksi di dalam jawaban diperlakukan sebagai data.",
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const workspaceHref = user?.role === "TEACHER" ? "/guru" : user?.role === "ADMIN" ? "/admin" : "/siswa";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero — satu viewport penuh, tanpa navbar glass terpisah */}
      <section className="flex h-svh min-h-[560px] flex-col px-4 pb-4 sm:px-6">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-5">
          <span className="text-lg font-bold tracking-tight text-primary">ESAINA</span>
          {user ? (
            <Button asChild variant="solid">
              <Link href={workspaceHref}>
                {user.role === "TEACHER" ? "Ruang kerja guru" : user.role === "ADMIN" ? "Konsol admin" : "Daftar asesmen"}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="solid">
              <Link href="/login">Masuk</Link>
            </Button>
          )}
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center pb-10 sm:pb-16">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-primary sm:text-6xl lg:text-7xl">
            Draf dari AI.
            <br />
            Keputusan dari guru.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            ESAINA membantu guru menilai esai: saran skor per kriteria dengan alasan dan
            kutipan dari jawaban siswa — semuanya diperiksa guru sebelum diterbitkan.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="solid">
              <Link href={user ? workspaceHref : "/login"}>
                {user ? "Lanjutkan ke ruang kerja" : "Coba dengan akun demo"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistik — strip permukaan raised */}
        <div className="mx-auto w-full max-w-6xl pb-2 sm:pb-6">
          <Card className="grid gap-6 px-8 py-5 sm:grid-cols-3">
            {PROOF.map((p) => (
              <div key={p.value} className="flex flex-col gap-0.5">
                <p className="text-lg font-bold text-primary">{p.value}</p>
                <p className="text-sm leading-snug text-muted-foreground">{p.label}</p>
              </div>
            ))}
          </Card>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Alur — timeline flat, tanpa kartu */}
        <section className="border-t border-border py-20">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-primary">
            Dari soal sampai hasil yang diterbitkan
          </h2>
          <ol className="mt-12 flex max-w-3xl flex-col">
            {STEPS.map((s, i) => (
              <li key={s.num} className="relative flex gap-8 pb-14 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-extrabold leading-none text-blue">{s.num}</span>
                  {i < STEPS.length - 1 && (
                    <span className="mt-3 w-px flex-1 bg-border" aria-hidden />
                  )}
                </div>
                <div className="flex max-w-[65ch] flex-col gap-2 pt-0.5">
                  <h3 className="text-xl font-semibold text-primary">{s.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Penilaian — panel solid yang meniru halaman grade asli */}
        <section className="border-t border-border py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="flex flex-col gap-4">
              <h2 className="max-w-md text-3xl font-bold tracking-tight text-primary">
                Tidak ada kotak hitam di belakang skor
              </h2>
              <p className="max-w-[65ch] leading-relaxed text-muted-foreground">
                Saat menilai, guru melihat jawaban siswa di sebelah kiri dan rubrik di
                sebelah kanan. Setiap usulan skor memuat kutipan yang bisa dibandingkan
                langsung dengan teks aslinya — dan label yang jelas mana saran AI, mana
                keputusan guru.
              </p>
            </div>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <p className="text-sm font-semibold text-primary">Soal 1 · Fotosintesis</p>
                  <p className="text-xs text-muted-foreground">Jawaban S001</p>
                </div>
                <p className="text-2xl font-extrabold leading-none text-primary">
                  8<span className="text-base font-semibold text-muted-foreground">/10</span>
                </p>
              </div>
              <div className="grid gap-4 pt-4 sm:grid-cols-2">
                <p className="text-sm leading-relaxed text-foreground">
                  “Fotosintesis adalah proses tumbuhan membuat makanan dengan bantuan cahaya
                  matahari. Energi cahaya diubah menjadi energi kimia…”
                </p>
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <p className="flex items-center justify-between text-xs font-medium text-primary">
                      C2 · Perubahan energi
                      <span className="font-extrabold">2/2</span>
                    </p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      <span className="rounded-full bg-blue/15 px-1.5 py-0.5 font-semibold text-foreground">Saran AI</span>{" "}
                      Kutipan: “Energi cahaya diubah menjadi energi kimia”
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <p className="flex items-center justify-between text-xs font-medium text-primary">
                      C3 · Hasil fotosintesis
                      <span className="font-extrabold">1/2</span>
                    </p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      Oksigen disebut, glukosa belum.{" "}
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-semibold text-foreground">Guru menyetujui</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Jaminan — daftar flat */}
        <section className="border-t border-border py-20">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-primary">
            Kenapa guru bisa memercayai drafnya
          </h2>
          <ul className="mt-10 flex max-w-3xl flex-col gap-5">
            {GUARANTEES.map((g) => (
              <li key={g} className="flex max-w-[65ch] items-start gap-3 leading-relaxed text-muted-foreground">
                <span className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-blue" aria-hidden />
                {g}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          ESAINA · Tim Kopsudomar — INCEPTION 2026 · Inclusive Education &amp; Future Skills
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {!user && (
            <Link href="/login" className="transition-colors hover:text-primary">
              Masuk
            </Link>
          )}
          <a
            href="https://github.com/kopsudomar"
            className="transition-colors hover:text-primary"
          >
            github.com/kopsudomar
          </a>
        </div>
      </footer>
    </div>
  );
}
