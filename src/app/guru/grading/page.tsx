import { redirect } from "next/navigation";
import { auth as getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth/config";
import { GradingList } from "@/app/guru/grading-list";

export default async function GradingAssessmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/siswa");
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10"><h1 className="text-3xl font-semibold text-primary">Penilaian</h1><GradingList /></main>;
}
