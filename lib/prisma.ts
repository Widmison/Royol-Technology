import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only create a new connection pool if we don't already have one
if (!globalForPrisma.prisma) {
  const connectionString = `${process.env.DATABASE_URL}`;
  
  // Set up the secure PostgreSQL adapter
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  // Pass the adapter into Prisma 7
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}