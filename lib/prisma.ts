import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function poolMaxClients(): number {
  const raw = process.env.PG_POOL_MAX?.trim();
  if (raw) {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }
  /**
   * Vercel serverless runs many concurrent isolates; Supabase “session” poolers often cap total clients (~15).
   * Default **1 connection per instance** avoids `EMAXCONNSESSION / max clients reached`.
   */
  if (process.env.VERCEL) return 1;
  return 10;
}

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

  const max = poolMaxClients();

  return new Pool({
    connectionString,
    max,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 20_000,
    /** Release idle clients so short-lived serverless functions don’t hold DB sessions. */
    allowExitOnIdle: true,
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