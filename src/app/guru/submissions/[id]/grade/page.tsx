import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { GradingDetail } from "@/app/guru/grading-detail";

type Props = { params: Promise<{ id: string }> };
export default async function GradePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/siswa");
  const { id } = await params;
  return <main className="mx-auto w-full max-w-6xl px-4 py-10"><GradingDetail submissionId={id} /></main>;
}
