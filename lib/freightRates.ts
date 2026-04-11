/**
 * Published rates (kept in sync with client dashboard pricing tab).
 */
export const AIR_PER_LB_USD = 4.9;
export const AIR_SERVICE_FEE_USD = 10;
export const OCEAN_PER_LB_USD = 2.9;
export const OCEAN_SERVICE_FEE_USD = 5;

function isOceanMethod(shippingMethod: string): boolean {
  const m = shippingMethod.trim().toLowerCase();
  return (
    m.includes("ocean") ||
    m.includes("sea") ||
    m.includes("bateau") ||
    m.includes("bato")
  );
}

export function calculateFreightTotal(
  weightLbs: number,
  shippingMethod: string
): number {
  if (!Number.isFinite(weightLbs) || weightLbs <= 0) return 0;
  const ocean = isOceanMethod(shippingMethod);
  const perLb = ocean ? OCEAN_PER_LB_USD : AIR_PER_LB_USD;
  const fee = ocean ? OCEAN_SERVICE_FEE_USD : AIR_SERVICE_FEE_USD;
  const total = weightLbs * perLb + fee;
  return Math.round(total * 100) / 100;
}
