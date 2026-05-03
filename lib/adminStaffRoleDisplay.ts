import { AdminStaffRole } from "@prisma/client";
import { normalizeStaffEmail } from "@/lib/normalizeStaffEmail";
import { STAFF_ALLOWLIST_OWNER_EMAIL } from "@/lib/webDevAccess";

export function adminStaffRoleLabel(
  role: AdminStaffRole | null | undefined,
  email?: string | null
): string {
  if (
    role === AdminStaffRole.ADMIN_TEAM &&
    email &&
    normalizeStaffEmail(email) === normalizeStaffEmail(STAFF_ALLOWLIST_OWNER_EMAIL)
  ) {
    return "Owner — full access";
  }
  switch (role) {
    case AdminStaffRole.WEB_DEV:
      return "Web Dev — full access";
    case AdminStaffRole.ADMIN_TEAM:
      return "Admin team";
    default:
      return "Admin";
  }
}
