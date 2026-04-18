import type { PackageStatus } from "@prisma/client";
import { optionForStatus } from "@/lib/adminTrackingStatusOptions";

/** Short English line for badges / tables */
export function packageStatusShortLabel(status: PackageStatus | string): string {
  const opt = optionForStatus(String(status));
  if (opt) return opt.label.replace(/^\d+ — /, "").trim();
  return String(status).replace(/_/g, " ");
}

/** Prefer bilingual detail when we have a preset; else location-style fallback */
export function packageStatusTimelineTitle(status: PackageStatus | string, description?: string | null) {
  if (description && description.trim().length > 0) return description.trim();
  const opt = optionForStatus(String(status));
  if (opt) return opt.detail;
  return String(status).replace(/_/g, " ");
}
