import { AdminStaffRole } from "@prisma/client";

export function adminStaffRoleLabel(role: AdminStaffRole | null | undefined): string {
  switch (role) {
    case AdminStaffRole.WEB_DEV:
      return "Web Dev — full access";
    case AdminStaffRole.ADMIN_TEAM:
      return "Admin team";
    default:
      return "Admin";
  }
}
