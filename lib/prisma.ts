import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPool(): Pool {
  /** Prefer DIRECT_URL (Supabase/Neon direct/session) — transaction poolers often break Prisma writes without extra flags. */
  const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL || "").trim();
  if (!connectionString) {
    throw new Error("Set DATABASE_URL (and ideally DIRECT_URL for hosted Postgres).");
  }

  const hostish = connectionString.toLowerCase();
  const needsSsl =
    hostish.includes("supabase.co") ||
    hostish.includes("neon.tech") ||
    hostish.includes("amazonaws.com") ||
    hostish.includes("sslmode=require") ||
    hostish.includes("ssl=true");

  return new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 20_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

// Only create a new connection pool if we don't already have one
if (!globalForPrisma.prisma) {
  const pool = createPool();
  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}