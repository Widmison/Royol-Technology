import { isStaffEmailAllowed } from "@/lib/adminStaffRegistry";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Any email on the staff allowlist is reserved from the client signup portal. */
export async function isAdminPortalLoginEmail(email: string): Promise<boolean> {
  return isStaffEmailAllowed(email);
}

/**
 * Bootstrap password for approved staff (first-time email/password admin login).
 * Prefer `MEX509_ADMIN_DEFAULT_PASSWORD`; falls back to `MEX509_ADMIN_PASSWORD`.
 */
export function defaultAdminBootstrapPassword(): string | undefined {
  const d = process.env.MEX509_ADMIN_DEFAULT_PASSWORD?.trim();
  const legacy = process.env.MEX509_ADMIN_PASSWORD?.trim();
  return d || legacy || undefined;
}

/** @deprecated use defaultAdminBootstrapPassword — kept for any external imports */
export function configuredAdminPassword(): string | undefined {
  return defaultAdminBootstrapPassword();
}
