/** Admin dashboard origin for email buttons (uses `MEX509_ADMIN_HOST` when set). */
export function getAdminPortalUrl(): string {
  const raw = process.env.MEX509_ADMIN_HOST?.trim();
  if (raw) {
    try {
      const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
      return u.origin.replace(/\/$/, "");
    } catch {
      /* fall through */
    }
  }
  return getPortalSiteUrl();
}

/** Canonical portal URL for emails and absolute links (no trailing slash). */
export function getPortalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      return u.origin.replace(/\/$/, "");
    } catch {
      /* fall through */
    }
  }
  return "https://portal.mex509.com";
}
