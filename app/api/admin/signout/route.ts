import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_PORTAL_ROLE_COOKIE,
  ADMIN_TOTP_GATE_COOKIE,
  clearSessionCookieOptions,
} from "@/lib/authCookies";
import { clearAdminOtpGateCookie } from "@/lib/adminOtpGateCookie";

/** Clears legacy password-based admin cookie (NextAuth sign-out is separate). */
export async function POST() {
  const store = await cookies();
  clearAdminOtpGateCookie(store);
  const o = clearSessionCookieOptions();
  store.set(ADMIN_SESSION_COOKIE, "", o);
  store.set(ADMIN_PORTAL_ROLE_COOKIE, "", o);
  store.set(ADMIN_TOTP_GATE_COOKIE, "", o);
  return NextResponse.json({ ok: true });
}
