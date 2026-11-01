import { auth } from "@/lib/auth";

export const authOptions: any = {};

export async function getServerSession(..._args: any[]) {
  return auth();
}
