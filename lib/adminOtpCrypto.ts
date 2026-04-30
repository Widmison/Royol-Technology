import { createHash, randomInt } from "crypto";

const PEPPER = () => process.env.MEX509_ADMIN_OTP_PEPPER?.trim() || "mex509-admin-otp-local-pepper";

export function generateAdminOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export function hashAdminOtpCode(code: string): string {
  return createHash("sha256").update(`${PEPPER()}:${code.trim()}`).digest("hex");
}

export function verifyAdminOtpCode(code: string, hash: string): boolean {
  return hashAdminOtpCode(code) === hash;
}
