import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { PublicationPanel } from "@/app/guru/publication-panel";
type Props = { params: Promise<{ id: string }> };
export default async function PublicationPage({ params }: Props) { const s = await getServerSession(authOptions); if (!s?.user) redirect("/login"); if (s.user.role !== "TEACHER") redirect("/siswa"); const { id } = await params; return <main className="mx-auto max-w-3xl px-4 py-10"><PublicationPanel assessmentId={id} /></main>; }
