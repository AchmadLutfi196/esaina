import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <main className="lg lg-regular lg-overlay flex w-full max-w-xl flex-col items-center gap-5 px-8 py-12 text-center">
        <h1 className="text-5xl font-semibold leading-none text-primary">ESAINA</h1>
        <p className="text-base text-muted-foreground">
          Platform penilaian esai: AI menyiapkan draf skor, guru memutuskan,
          siswa melihat hasil terbit.
        </p>

        {user ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm">
              Masuk sebagai <strong>{user.name}</strong> ·{" "}
              {user.role === "TEACHER" ? "Guru" : "Siswa"}
            </p>
            <div className="flex items-center gap-2">
              {user.role === "TEACHER" ? (
                <Button asChild variant="default">
                  <Link href="/guru">Ruang kerja guru</Link>
                </Button>
              ) : (
                <Button asChild variant="default">
                  <Link href="/siswa">Daftar asesmen</Link>
                </Button>
              )}
              <LogoutButton />
            </div>
          </div>
        ) : (
          <Button asChild variant="default" size="lg">
            <Link href="/login">Masuk</Link>
          </Button>
        )}
      </main>
    </div>
  );
}
