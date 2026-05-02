import { createHash, randomInt } from "crypto";

const LOCAL_DEV_FALLBACK = "mex509-admin-otp-local-pepper";

function otpPepper(): string {
  const p = process.env.MEX509_ADMIN_OTP_PEPPER?.trim();
  if (p && p.length >= 16) return p;

  const strict =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.REQUIRE_ADMIN_OTP_PEPPER === "1";

  if (strict) {
    throw new Error(
      "MEX509_ADMIN_OTP_PEPPER must be set to a secret of at least 16 characters in production (openssl rand -hex 32)."
    );
  }

  return LOCAL_DEV_FALLBACK;
}

export function generateAdminOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export function hashAdminOtpCode(code: string): string {
  return createHash("sha256").update(`${otpPepper()}:${code.trim()}`).digest("hex");
}

export function verifyAdminOtpCode(code: string, hash: string): boolean {
  return hashAdminOtpCode(code) === hash;
}
