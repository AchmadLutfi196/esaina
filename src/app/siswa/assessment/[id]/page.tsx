import { redirect } from "next/navigation";
import { auth as getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth/config";
import { StudentWork } from "./student-work";

type Props = { params: Promise<{ id: string }> };

export default async function AssessmentPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/guru");
  const { id } = await params;
  return <StudentWork assessmentId={id} />;
}
