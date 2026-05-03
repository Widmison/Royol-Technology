import { createHmac, timingSafeEqual } from "crypto";
import { normalizeStaffEmail } from "@/lib/adminStaffRegistry";
import { clearSessionCookieOptions, sessionCookieOptions } from "@/lib/authCookies";

/** Binds successful email OTP to the subsequent TOTP step (cannot skip OTP by calling step=totp alone). */
export const ADMIN_OTP_GATE_COOKIE = "adminOtpGate";

const GATE_TTL_SEC = 5 * 60;

type GatePayload = { email: string; exp: number };

function timingSafeSigEqual(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

export function signAdminOtpGateToken(email: string): string | null {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) return null;
  const normalized = normalizeStaffEmail(email);
  const payload: GatePayload = {
    email: normalized,
    exp: Date.now() + GATE_TTL_SEC * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyAdminOtpGateToken(
  cookieValue: string | undefined,
  expectedEmailRaw: string
): boolean {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!cookieValue || !secret) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const [payloadB64, sig] = parts;
  const check = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  if (!timingSafeSigEqual(check, sig)) return false;

  let parsed: GatePayload;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as GatePayload;
  } catch {
    return false;
  }
  if (typeof parsed.email !== "string" || typeof parsed.exp !== "number") return false;
  if (Date.now() >= parsed.exp) return false;
  const want = normalizeStaffEmail(expectedEmailRaw).toLowerCase();
  return parsed.email === want;
}

export function adminOtpGateCookieSetOpts() {
  const base = sessionCookieOptions();
  return { ...base, maxAge: GATE_TTL_SEC };
}

export function clearAdminOtpGateCookie(store: {
  set: (name: string, value: string, options: ReturnType<typeof clearSessionCookieOptions>) => void;
}) {
  const o = clearSessionCookieOptions();
  store.set(ADMIN_OTP_GATE_COOKIE, "", o);
}
