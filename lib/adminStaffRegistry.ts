import type { AdminStaffRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StaffRegistryEntry = {
  email: string;
  staffRole: AdminStaffRole;
  roleLabel: string;
};

export function normalizeStaffEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Resolve allowlisted staff row from the database (case-insensitive email). */
export async function getStaffRegistryEntry(email: string): Promise<StaffRegistryEntry | undefined> {
  const n = normalizeStaffEmail(email);
  const row = await prisma.staffAllowlistEntry.findFirst({
    where: { email: { equals: n, mode: "insensitive" } },
  });
  if (!row) return undefined;
  return {
    email: row.email,
    staffRole: row.staffRole,
    roleLabel: row.roleLabel || "",
  };
}

export async function isStaffEmailAllowed(email: string): Promise<boolean> {
  const n = normalizeStaffEmail(email);
  const count = await prisma.staffAllowlistEntry.count({
    where: { email: { equals: n, mode: "insensitive" } },
  });
  return count > 0;
}
