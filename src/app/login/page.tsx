import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { LoginForm } from "./login-form";

export const metadata = { title: "Masuk — ESAINA" };

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <main className="lg lg-regular lg-overlay flex w-full max-w-md flex-col gap-6 px-8 py-10">
        <header className="flex flex-col gap-1 text-center">
          <h1 className="text-4xl font-semibold leading-none text-primary">ESAINA</h1>
          <p className="text-sm text-muted-foreground">
            Masuk sesuai peran akun Anda.
          </p>
        </header>
        <LoginForm />
      </main>
    </div>
  );
}
