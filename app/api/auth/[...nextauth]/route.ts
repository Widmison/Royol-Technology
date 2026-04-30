import type { NextRequest } from "next/server";
import { handlers } from "@/auth";

const hasSecret =
  typeof process.env.AUTH_SECRET === "string" &&
  process.env.AUTH_SECRET.trim().length > 0 &&
  process.env.AUTH_SECRET !== "changeme";

function warnIfAuthSecretMissing(): void {
  if (process.env.VERCEL !== "1" || hasSecret) return;
  console.error(
    "[NextAuth] AUTH_SECRET is missing or placeholder — /api/auth/session may return 500. Add AUTH_SECRET in Vercel → Settings → Environment Variables (Production)."
  );
}

warnIfAuthSecretMissing();

async function wrap(label: string, req: NextRequest, fn: (r: NextRequest) => Promise<Response>) {
  try {
    return await fn(req);
  } catch (e) {
    console.error(`[NextAuth ${label}]`, e);
    throw e;
  }
}

export const GET = (req: NextRequest) => wrap("GET", req, handlers.GET);
export const POST = (req: NextRequest) => wrap("POST", req, handlers.POST);
