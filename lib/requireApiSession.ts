import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/authCookies";

export async function requireClientApiUser(): Promise<User | NextResponse> {
  const id = (await cookies()).get(CLIENT_SESSION_COOKIE)?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

export async function requireAdminApiUser(): Promise<User | NextResponse> {
  const session = await auth();
  if (session?.user?.id && session.user.role === "admin") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role === "ADMIN") return user;
  }

  const id = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}
