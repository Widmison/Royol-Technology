const DEFAULT_PICKUP_RATE_PER_MILE = 2.25;

const CITY_DISTANCE_ESTIMATES: Array<{ pattern: RegExp; miles: number }> = [
  { pattern: /miami|doral|hialeah|miami springs/i, miles: 12 },
  { pattern: /fort lauderdale|hollywood|pembroke|miramar/i, miles: 28 },
  { pattern: /west palm|boca|delray/i, miles: 62 },
  { pattern: /naples|fort myers/i, miles: 130 },
  { pattern: /orlando|kissimmee|winter park/i, miles: 236 },
  { pattern: /tampa|st\.?\s*petersburg|clearwater/i, miles: 283 },
  { pattern: /jacksonville/i, miles: 345 },
];

function normalize(text: string | null | undefined): string {
  return typeof text === "string" ? text.trim().toLowerCase() : "";
}

export function estimatePickupDistanceMiles(params: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}): number {
  const searchText = [params.address, params.city, params.state, params.zipCode].map(normalize).join(" ");
  for (const row of CITY_DISTANCE_ESTIMATES) {
    if (row.pattern.test(searchText)) return row.miles;
  }
  return 25;
}

export function calculatePickupAutoQuote(distanceMiles: number, ratePerMile = DEFAULT_PICKUP_RATE_PER_MILE): number {
  const miles = Number.isFinite(distanceMiles) && distanceMiles > 0 ? distanceMiles : 0;
  const raw = miles * ratePerMile;
  return Math.round(raw * 100) / 100;
}

export function getPickupRatePerMile(): number {
  return DEFAULT_PICKUP_RATE_PER_MILE;
}
