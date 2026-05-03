import { createHmac, timingSafeEqual } from "crypto";
import {
  ADMIN_TOTP_GATE_COOKIE,
  ADMIN_PORTAL_ROLE_COOKIE,
  sessionCookieOptions,
  clearSessionCookieOptions,
  type WritableCookieStore,
} from "@/lib/authCookies";
import { ADMIN_TOTP_GATE_SALT } from "@/lib/adminTotpGateConstants";

/** Signed cookie: proves this browser completed admin TOTP enrollment for `userId`. */
export function signAdminTotpGateCookie(userId: string, secret: string): string {
  const mac = createHmac("sha256", secret)
    .update(`${userId}|${ADMIN_TOTP_GATE_SALT}`)
    .digest();
  return `${userId}.${mac.toString("base64url")}`;
}

export function verifyAdminTotpGateCookieNode(
  cookieVal: string | undefined,
  userId: string,
  secret: string
): boolean {
  if (!cookieVal || !userId || !secret) return false;
  const dot = cookieVal.indexOf(".");
  if (dot <= 0) return false;
  const id = cookieVal.slice(0, dot);
  const sigB64 = cookieVal.slice(dot + 1);
  if (id !== userId || !sigB64) return false;

  const expectedMac = createHmac("sha256", secret)
    .update(`${userId}|${ADMIN_TOTP_GATE_SALT}`)
    .digest();
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(sigB64, "base64url");
  } catch {
    return false;
  }
  if (sigBuf.length !== expectedMac.length) return false;
  return timingSafeEqual(sigBuf, expectedMac);
}

export function setAdminTotpGateCookie(store: WritableCookieStore, userId: string, secret: string) {
  if (!secret.trim()) return;
  store.set(ADMIN_TOTP_GATE_COOKIE, signAdminTotpGateCookie(userId, secret), sessionCookieOptions());
}

export function clearAdminTotpGateCookie(store: WritableCookieStore) {
  store.set(ADMIN_TOTP_GATE_COOKIE, "", clearSessionCookieOptions());
}

export type AdminPortalRoleCookieValue = "admin" | "staff";

export function setAdminPortalRoleCookie(store: WritableCookieStore, role: AdminPortalRoleCookieValue) {
  store.set(ADMIN_PORTAL_ROLE_COOKIE, role, sessionCookieOptions());
}

export function clearAdminPortalRoleCookie(store: WritableCookieStore) {
  store.set(ADMIN_PORTAL_ROLE_COOKIE, "", clearSessionCookieOptions());
}
