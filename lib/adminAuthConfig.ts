import { isStaffEmailAllowed } from "@/lib/adminStaffRegistry";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Backward-compatible name — any email in the staff registry is reserved from the client portal. */
export function isAdminPortalLoginEmail(email: string) {
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
