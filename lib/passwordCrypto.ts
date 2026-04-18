import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";

const BCRYPT_PREFIX = "$2";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/** Verify bcrypt hashes; legacy plaintext (pre-migration) uses constant-time comparison when lengths match. */
export async function verifyPassword(
  plain: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored || plain === undefined || plain === null) return false;
  if (stored.startsWith(BCRYPT_PREFIX)) {
    return bcrypt.compare(plain, stored);
  }
  const a = Buffer.from(plain, "utf8");
  const b = Buffer.from(stored, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function shouldUpgradePasswordHash(stored: string | null | undefined): boolean {
  return !!stored && !stored.startsWith(BCRYPT_PREFIX);
}

/** Compare two UTF-8 strings in constant time (same-length only). */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
