import { AdminStaffRole } from "@prisma/client";

export type StaffRegistryEntry = {
  email: string;
  staffRole: AdminStaffRole;
  roleLabel: string;
};

/** Approved admin portal identities — matched on email/password admin sign-in. */
export const ADMIN_STAFF_REGISTRY: StaffRegistryEntry[] = [
  {
    email: "widmisonfrancois@royoltechnology.com",
    staffRole: AdminStaffRole.WEB_DEV,
    roleLabel: "Web Dev — full access",
  },
  {
    email: "info@mex509.com",
    staffRole: AdminStaffRole.ADMIN_TEAM,
    roleLabel: "Admin team",
  },
];

export function normalizeStaffEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getStaffRegistryEntry(email: string): StaffRegistryEntry | undefined {
  const n = normalizeStaffEmail(email);
  return ADMIN_STAFF_REGISTRY.find((e) => normalizeStaffEmail(e.email) === n);
}

export function isStaffEmailAllowed(email: string): boolean {
  return !!getStaffRegistryEntry(email);
}

