/**
 * Edge-safe HMAC verify for middleware (no Node `crypto`).
 * Keep message format identical to `signAdminTotpGateCookie` in `lib/adminTotpGateCookie.ts`.
 */
import { ADMIN_TOTP_GATE_SALT } from "@/lib/adminTotpGateConstants";

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyAdminTotpGateCookieEdge(
  cookieVal: string | undefined,
  userId: string,
  secret: string
): Promise<boolean> {
  if (!cookieVal || !userId || !secret) return false;
  const dot = cookieVal.indexOf(".");
  if (dot <= 0) return false;
  const id = cookieVal.slice(0, dot);
  const sigB64 = cookieVal.slice(dot + 1);
  if (id !== userId || !sigB64) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${userId}|${ADMIN_TOTP_GATE_SALT}`)
  );
  const expected = bufferToBase64Url(sigBuf);
  return timingSafeEqualStr(sigB64, expected);
}
