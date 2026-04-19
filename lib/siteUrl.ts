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
