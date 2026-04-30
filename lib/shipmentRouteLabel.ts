import { DESTINATION_COUNTRIES } from "@/lib/address-options";

/** Resolve stored country code or label to a friendly destination name for UI (quote uses ISO codes). */
export function destinationCountryLabel(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Haiti";
  const t = raw.trim();
  const byCode = DESTINATION_COUNTRIES.find((c) => c.code === t);
  if (byCode) return byCode.name;
  const byName = DESTINATION_COUNTRIES.find((c) => c.name.toLowerCase() === t.toLowerCase());
  if (byName) return byName.name;
  return t;
}

export function shipmentRouteLabel(departure: string, destinationCountry: string | null | undefined): string {
  return `${departure} → ${destinationCountryLabel(destinationCountry)}`;
}
