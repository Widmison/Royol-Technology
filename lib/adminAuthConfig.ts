/** Only this identity may use the admin portal login (`/api/admin/auth`). */
export const ADMIN_PORTAL_LOGIN_EMAIL = "widmisonfrancois@royoltechnology.com";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAdminPortalLoginEmail(email: string) {
  return normalizeEmail(email) === normalizeEmail(ADMIN_PORTAL_LOGIN_EMAIL);
}

/** Set `MEX509_ADMIN_PASSWORD` in production (e.g. Vercel) and locally in `.env.local`. Never commit real passwords. */
export function configuredAdminPassword(): string | undefined {
  const p = process.env.MEX509_ADMIN_PASSWORD?.trim();
  return p || undefined;
}
