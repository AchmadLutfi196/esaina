export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <main className="flex w-full max-w-xl flex-col items-center gap-4 px-8 py-12 text-center lg lg-regular lg-surface">
        <h1 className="font-heading text-5xl leading-none text-primary">
          ESAINA
        </h1>
        <p className="text-base text-muted-foreground">
          Platform penilaian esai: AI menyiapkan draf skor, guru memutuskan,
          siswa melihat hasil terbit.
        </p>
        <span className="text-sm text-muted-foreground">
          Login akan hadir di Fase 1 — Hacking Day INCEPTION 2026
        </span>
      </main>
    </div>
  );
}
