import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Migrations / CLI: prefer DIRECT_URL (e.g. Neon non-pooled); else same as app runtime DATABASE_URL. */
const datasourceUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!datasourceUrl) {
  throw new Error("Set DATABASE_URL in .env (and optionally DIRECT_URL for migrate on pooled hosts).");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
});