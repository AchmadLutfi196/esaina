import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const ssl = process.env.SUPABASE_CA_B64
      ? { ca: Buffer.from(process.env.SUPABASE_CA_B64, "base64").toString("utf8"), rejectUnauthorized: true }
      : undefined;
    const adapter = new PrismaPg({ connectionString: dbUrl, ssl });
    return new PrismaClient({ adapter });
  }

  // Fallback to SQLite adapter for local dev
  try {
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    return new PrismaClient({ adapter });
  } catch {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: dbUrl });
    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
