import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JoinClassView } from "@/components/classes/join-class-view";

export const metadata = { title: "Gabung Kelas" };

export default async function JoinClassPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  return <JoinClassView />;
}
