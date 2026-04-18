import { estimateShippingTotal, type CalculatorMethod } from "@/lib/shippingCalculatorRates";

/**
 * Maps quote / request labels (e.g. "Air Freight", "Ocean Freight") to calculator lanes
 * so warehouse intake and `/api/invoice` match the public shipping estimator (same per-lb rates).
 */
export function shippingMethodToCalculatorMethod(shippingMethod: string): CalculatorMethod {
  const m = (shippingMethod || "").trim().toLowerCase();
  if (m.includes("ground") || m.includes("terrestre")) return "ground";
  if (
    m.includes("ocean") ||
    m.includes("sea") ||
    m.includes("bateau") ||
    m.includes("bato")
  ) {
    return "sea";
  }
  return "air";
}

export function calculateFreightTotal(weightLbs: number, shippingMethod: string): number {
  return estimateShippingTotal(weightLbs, shippingMethodToCalculatorMethod(shippingMethod));
}
