import { cache } from "react";
import { cookies } from "next/headers";
import type { Session } from "next-auth";
import type { User } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/authCookies";
import { looksLikePrismaUserId } from "@/lib/prismaUserId";
import { isPortalStaffRole } from "@/lib/staffAccess";

async function resolveClientSessionUser(): Promise<User | null> {
  const id = (await cookies()).get(CLIENT_SESSION_COOKIE)?.value?.trim();
  if (!id || !looksLikePrismaUserId(id)) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "CLIENT") return null;
  return user;
}

/** Deduped per request (layout + pages + API handlers that import this). */
export const getClientSessionUser = cache(resolveClientSessionUser);

function isDynamicServerUsage(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const d = (err as Error & { digest?: string }).digest;
  return d === "DYNAMIC_SERVER_USAGE" || err.message.includes("Dynamic server usage");
}

/** NextAuth `auth()` for API / layout — never throws except Dynamic Server Usage (rethrown). */
export async function authSessionOrNull(): Promise<Session | null> {
  try {
    return await auth();
  } catch (err) {
    if (isDynamicServerUsage(err)) throw err;
    console.error("[authSessionOrNull] auth() failed — check AUTH_SECRET on Vercel.", err);
    return null;
  }
}

async function resolveAdminSessionUser(): Promise<User | null> {
  const session = await authSessionOrNull();
  if (session?.user?.id && session.user.role === "admin") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user && isPortalStaffRole(user.role)) return user;
  }

  const id = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value?.trim();
  if (!id || !looksLikePrismaUserId(id)) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !isPortalStaffRole(user.role)) return null;
  return user;
}

/** Deduped per request (layout + pages + guards). */
export const getAdminSessionUser = cache(resolveAdminSessionUser);
