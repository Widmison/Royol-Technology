/** Estimator rates for the public shipping calculator (per lb, no extra fees in this estimate). */
export const CALC_AIR_PER_LB = 4.9;
export const CALC_SEA_PER_LB = 3.1;
export const CALC_GROUND_PER_LB = 1.1;

export type CalculatorMethod = "air" | "sea" | "ground";

const RATES: Record<CalculatorMethod, number> = {
  air: CALC_AIR_PER_LB,
  sea: CALC_SEA_PER_LB,
  ground: CALC_GROUND_PER_LB,
};

export function estimateShippingTotal(weightLbs: number, method: CalculatorMethod): number {
  const w = typeof weightLbs === "string" ? parseFloat(weightLbs) : weightLbs;
  if (!Number.isFinite(w) || w <= 0) return 0;
  const total = w * RATES[method];
  return Math.round(total * 100) / 100;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
