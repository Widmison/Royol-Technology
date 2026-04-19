import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  clearSessionCookieOptions,
} from "@/lib/authCookies";

/** Clears legacy password-based admin cookie (NextAuth sign-out is separate). */
export async function POST() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", clearSessionCookieOptions());
  return NextResponse.json({ ok: true });
}
