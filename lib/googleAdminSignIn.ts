import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getStaffRegistryEntry, normalizeStaffEmail } from "@/lib/adminStaffRegistry";
import { hashPassword } from "@/lib/passwordCrypto";

/**
 * Resolve or create an ADMIN row for Google OAuth (staff registry only).
 * Returns null if email is not allowed or belongs to a non-admin account.
 */
export async function ensureGoogleAdminUser(emailRaw: string) {
  const email = normalizeStaffEmail(emailRaw);
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (existing) {
    if (existing.role !== "ADMIN") return null;
    return existing;
  }

  const registry = getStaffRegistryEntry(email);
  if (!registry) return null;

  const placeholder = randomBytes(32).toString("hex");
  return prisma.user.create({
    data: {
      email,
      password: await hashPassword(placeholder),
      role: "ADMIN",
      isVerified: true,
      firstName: "Staff",
      lastName: "MEX509",
      adminStaffRole: registry.staffRole,
      adminProfileComplete: false,
    },
  });
}
