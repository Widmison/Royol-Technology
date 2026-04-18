/**
 * Client timelines should not surface internal “manual admin” markers, and events
 * that consist only of that marker are dropped entirely.
 */

const MANUAL_ADMIN_LINE = /^\s*Manually updated by Admin\s*$/i;

/** Remove trailing “Manually updated by Admin” lines / suffixes from stored descriptions. */
export function stripManualAdminTrackingSuffix(description: string | null | undefined): string | null {
  if (description == null) return null;
  let s = String(description).trim();
  if (!s) return null;

  const lines = s.split(/\r?\n/).filter((line) => !MANUAL_ADMIN_LINE.test(line));
  s = lines.join("\n").trim();

  s = s.replace(/\s+Manually updated by Admin\s*$/i, "").trim();

  if (/^manually\s+updated\s+by\s+admin$/i.test(s)) return null;
  return s.length > 0 ? s : null;
}

/** True when this event should not appear on client-facing timelines at all. */
export function shouldOmitClientTrackingEvent(description: string | null | undefined): boolean {
  if (description == null || !String(description).trim()) return false;
  return stripManualAdminTrackingSuffix(description) == null;
}
