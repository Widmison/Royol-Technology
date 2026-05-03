import type { User } from "@prisma/client";
import { AdminStaffRole } from "@prisma/client";
import { normalizeStaffEmail } from "@/lib/normalizeStaffEmail";

/**
 * Business owner / head account — same allowlist powers as Web Dev (invite & remove staff emails).
 * Single canonical address; keep allowlist row in sync so sign-in still resolves this role.
 */
export const STAFF_ALLOWLIST_OWNER_EMAIL = "info@mex509.com";

/**
 * Web Dev (enum) or the owner email — the only accounts that may view/edit `StaffAllowlistEntry`.
 */
export function canManageStaffAllowlist(
  user: Pick<User, "role" | "adminStaffRole" | "email"> | null | undefined
): boolean {
  if (!user || user.role !== "ADMIN") return false;
  if (user.adminStaffRole === AdminStaffRole.WEB_DEV) return true;
  return normalizeStaffEmail(user.email) === normalizeStaffEmail(STAFF_ALLOWLIST_OWNER_EMAIL);
}

/** @deprecated Prefer `canManageStaffAllowlist` for allowlist UI; this is Web Dev enum only. */
export function isWebDevPortalAdmin(
  user: Pick<User, "role" | "adminStaffRole"> | null | undefined
): boolean {
  return user?.role === "ADMIN" && user.adminStaffRole === AdminStaffRole.WEB_DEV;
}
