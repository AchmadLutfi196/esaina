import { redirect } from "next/navigation";
import { auth as getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth/config";
import { StudentResults } from "../student-results";
export default async function ResultsPage() { const s = await getServerSession(authOptions); if (!s?.user) redirect("/login"); if (s.user.role !== "STUDENT") redirect("/guru"); return <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-10"><h1 className="text-3xl font-semibold text-primary">Hasil saya</h1><StudentResults /></main>; }
