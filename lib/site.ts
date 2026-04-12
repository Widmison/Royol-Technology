/**
 * Canonical site origin for metadata, sitemap, robots, and JSON-LD.
 * Priority: `NEXT_PUBLIC_SITE_URL` → Vercel preview `VERCEL_URL` → production default `https://mex509.com` → localhost.
 */
const PRODUCTION_CANONICAL = "https://mex509.com";

export function getSiteUrlString(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/+$/, "");
  if (vercel) return `https://${vercel}`;
  if (process.env.NODE_ENV === "production") return PRODUCTION_CANONICAL;
  return "http://localhost:3000";
}

export function getSiteUrl(): URL {
  return new URL(getSiteUrlString());
}
