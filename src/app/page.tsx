import Link from "next/link";
import { getServerSession } from "next-auth";
import { ClipboardCheck, GraduationCap, PenLine, ShieldCheck } from "lucide-react";
import { authOptions } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = [
  {
    icon: ClipboardCheck,
    title: "Guru",
    body: "Menilai esai dengan saran skor per kriteria, mengesahkan, lalu menerbitkan hasil.",
  },
  {
    icon: PenLine,
    title: "Siswa",
    body: "Mengerjakan esai dengan simpan otomatis dan melihat hasil yang sudah diterbitkan.",
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    body: "Mengelola akun pengguna dan memantau progres penilaian sekolah.",
  },
];

const STEPS = [
  {
    title: "AI menyiapkan draf",
    body: "Untuk setiap kriteria, sistem mengusulkan skor, alasan, kutipan dari jawaban, dan draf feedback.",
  },
  {
    title: "Guru memutuskan",
    body: "Guru memakai, menyunting, atau menolak saran. Nilai final hanya sah setelah guru mengesahkannya.",
  },
  {
    title: "Siswa melihat hasil",
    body: "Siswa hanya melihat hasil setelah guru menerbitkannya; versi lama tetap tampil sampai revisi terbit.",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const workspaceHref =
    user?.role === "TEACHER" ? "/guru" : user?.role === "ADMIN" ? "/admin" : "/siswa";
  const workspaceLabel =
    user?.role === "TEACHER"
      ? "Ruang kerja guru"
      : user?.role === "ADMIN"
        ? "Konsol admin"
        : "Daftar asesmen";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" aria-hidden />
          <span className="font-heading text-lg font-bold tracking-tight text-primary">
            ESAINA
          </span>
        </Link>
        <Button asChild variant="solid">
          <Link href={user ? workspaceHref : "/login"}>
            {user ? workspaceLabel : "Masuk"}
          </Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-16 pb-16">
        <section className="flex flex-col gap-5 py-10 sm:py-16">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
            Penilaian esai yang bisa dijelaskan
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            AI menyiapkan draf skor beserta alasan dan kutipan dari jawaban siswa. Guru
            memutuskan, dan siswa melihat hasil yang sudah diterbitkan.
          </p>
          <div>
            <Button asChild size="lg" variant="solid">
              <Link href={user ? workspaceHref : "/login"}>
                {user ? workspaceLabel : "Masuk"}
              </Link>
            </Button>
          </div>
        </section>

        <section aria-labelledby="peran-heading" className="flex flex-col gap-5">
          <h2 id="peran-heading" className="text-2xl font-semibold tracking-tight text-primary">
            Siapa memakai apa
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {ROLES.map((role) => (
              <Card key={role.title}>
                <CardHeader>
                  <role.icon className="size-5 text-primary" aria-hidden />
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="alur-heading" className="flex flex-col gap-5">
          <h2 id="alur-heading" className="text-2xl font-semibold tracking-tight text-primary">
            Alur penilaian
          </h2>
          <ol className="flex flex-col gap-6">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--neu-surface-soft)] text-sm font-semibold text-primary"
                >
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-primary">
                    <span className="sr-only">Langkah {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="max-w-[65ch] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-xs text-muted-foreground">
        ESAINA · Tim Kopsudomar · INCEPTION 2026
      </footer>
    </div>
  );
}
