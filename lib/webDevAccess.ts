import type { User } from "@prisma/client";
import { AdminStaffRole } from "@prisma/client";

/**
 * “Web Dev” is the only role that can manage the staff allowlist, analytics shell, etc.
 * `info@mex509.com` (ADMIN_TEAM) is a full admin for operations but not this control plane.
 */
export function isWebDevPortalAdmin(
  user: Pick<User, "role" | "adminStaffRole"> | null | undefined
): boolean {
  return user?.role === "ADMIN" && user.adminStaffRole === AdminStaffRole.WEB_DEV;
}
