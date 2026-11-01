import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#EBF2FD] via-[#F2F6FD] to-[#FCFDFF] p-4 sm:p-6">
      <AmbientBackdrop />
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
