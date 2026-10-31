import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const createPrisma = () => {
  const ssl = process.env.SUPABASE_CA_B64
    ? { ca: Buffer.from(process.env.SUPABASE_CA_B64, "base64").toString("utf8"), rejectUnauthorized: true }
    : undefined;
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrisma> };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
