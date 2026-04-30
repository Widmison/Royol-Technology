import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authSessionOrNull } from "@/lib/serverSession";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/authCookies";
import { looksLikePrismaUserId } from "@/lib/prismaUserId";
import { isPortalStaffRole, isSuperAdminUser } from "@/lib/staffAccess";

export async function requireClientApiUser(): Promise<User | NextResponse> {
  const id = (await cookies()).get(CLIENT_SESSION_COOKIE)?.value?.trim();
  if (!id || !looksLikePrismaUserId(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

export async function requireAdminApiUser(): Promise<User | NextResponse> {
  const session = await authSessionOrNull();
  if (session?.user?.id && session.user.role === "admin") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user && isPortalStaffRole(user.role)) return user;
  }

  const id = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value?.trim();
  if (!id || !looksLikePrismaUserId(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !isPortalStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

/** Super-admins only (`ADMIN` role) — 2FA management, future destructive actions, staff-only pages. */
export async function requireSuperAdminApiUser(): Promise<User | NextResponse> {
  const r = await requireAdminApiUser();
  if (r instanceof NextResponse) return r;
  if (!isSuperAdminUser(r)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return r;
}
