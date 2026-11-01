import { redirect } from "next/navigation";
import { auth as getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth/config";
import { SubmissionList } from "@/app/guru/submission-list";

type Props = { params: Promise<{ id: string }> };
export default async function SubmissionListPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/siswa");
  const { id } = await params;
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10"><h1 className="text-3xl font-semibold text-primary">Daftar LJK</h1><SubmissionList assessmentId={id} /></main>;
}
