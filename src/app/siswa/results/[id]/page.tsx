import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { ResultDetail } from "./result-detail";
type Props = { params: Promise<{ id: string }> };
export default async function ResultPage({ params }: Props) { const s = await getServerSession(authOptions); if (!s?.user) redirect("/login"); if (s.user.role !== "STUDENT") redirect("/guru"); const { id } = await params; return <main className="mx-auto max-w-3xl px-4 py-10"><ResultDetail id={id} /></main>; }
