import type { Role } from "@prisma/client";
import type { User } from "@prisma/client";

export function isPortalStaffRole(role: Role): boolean {
  return role === "ADMIN" || role === "STAFF";
}

export function isSuperAdminUser(user: Pick<User, "role">): boolean {
  return user.role === "ADMIN";
}

export type StaffCapability =
  | "clients:create"
  | "clients:update"
  | "quotes:delete"
  | "packages:intake-create"
  | "invoices:mark-paid"
  | "tracking:scan-update"
  | "tracking:external-review"
  | "pickups:manage";

/**
 * STAFF is intentionally constrained to operational tasks only.
 * ADMIN can perform all capabilities by default.
 */
export function canPerformStaffCapability(user: Pick<User, "role">, capability: StaffCapability): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role !== "STAFF") return false;

  switch (capability) {
    case "clients:create":
    case "clients:update":
    case "packages:intake-create":
    case "invoices:mark-paid":
    case "tracking:scan-update":
    case "tracking:external-review":
    case "pickups:manage":
      return true;
    case "quotes:delete":
      return false;
    default: {
      const _exhaustive: never = capability;
      return _exhaustive;
    }
  }
}
