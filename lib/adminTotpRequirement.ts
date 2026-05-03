import type { User } from "@prisma/client";

/**
 * Full admins (Prisma `ADMIN`) must enroll TOTP before using the portal.
 * Operational `STAFF` accounts are excluded.
 */
export function adminNeedsAuthenticatorEnrollment(
  user: Pick<User, "role" | "twoFactorEnabled"> | null | undefined
): boolean {
  return !!user && user.role === "ADMIN" && !user.twoFactorEnabled;
}
