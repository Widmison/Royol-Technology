/**
 * Pickup photos must be uploaded via our Blob route; reject arbitrary URLs (SSRF/abuse).
 */
export function isTrustedClientPickupPhotoUrl(url: string | null | undefined, clientId: string): boolean {
  if (url == null || url === "") return true;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return false;
  const needle = `/pickup-requests/${clientId}/`;
  if (!parsed.pathname.includes(needle)) return false;
  return true;
}
