/** Values persisted from the public quote form — keep in sync with `app/quote/page.tsx`. */
export const QUOTE_SHIPPING_METHODS = ["Air Freight", "Ocean Freight", "Ground Freight"] as const;

export type QuoteShippingMethod = (typeof QUOTE_SHIPPING_METHODS)[number];

export function normalizeQuoteShippingMethod(
  input: unknown,
  fallback: string
): QuoteShippingMethod {
  const allowed = QUOTE_SHIPPING_METHODS as readonly string[];
  const s = typeof input === "string" ? input.trim() : "";
  if (allowed.includes(s)) return s as QuoteShippingMethod;
  const fb = typeof fallback === "string" ? fallback.trim() : "";
  if (allowed.includes(fb)) return fb as QuoteShippingMethod;
  return "Air Freight";
}
