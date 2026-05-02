import { DESTINATION_COUNTRIES } from "@/lib/address-options";

const DESTINATION_CODES = new Set(DESTINATION_COUNTRIES.map((c) => c.code));

const ALLOW_DEPARTURE = new Set(["USA", "DR", "China"]);
const ALLOW_SHIPPING = new Set(["Air Freight", "Ocean Freight", "Ground Freight"]);
const ALLOW_CATEGORY = new Set(["Electronics", "Clothing", "Documents", "Heavy", "Other"]);

const LIMITS = {
  firstName: 80,
  lastName: 80,
  phone: 40,
  departure: 24,
  category: 48,
  description: 4000,
  shippingMethod: 48,
  destinationCountry: 8,
  address: 300,
  state: 80,
  city: 120,
  zipCode: 24,
} as const;

function trimStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export type ValidatedQuotePayload = {
  firstName: string;
  lastName: string;
  phone: string;
  departure: string;
  category: string;
  description: string;
  shippingMethod: string;
  destinationCountry: string | null;
  address: string;
  state: string;
  city: string;
  zipCode: string;
};

export function validateQuoteRequestBody(raw: unknown): { ok: true; data: ValidatedQuotePayload } | { ok: false; message: string } {
  if (raw === null || typeof raw !== "object") {
    return { ok: false, message: "Invalid JSON body." };
  }
  const b = raw as Record<string, unknown>;

  const firstName = trimStr(b.firstName, LIMITS.firstName);
  const lastName = trimStr(b.lastName, LIMITS.lastName);
  const phone = trimStr(b.phone, LIMITS.phone);
  const departure = trimStr(b.departure, LIMITS.departure);
  const category = trimStr(b.category, LIMITS.category);
  const description = trimStr(b.description, LIMITS.description);
  const shippingMethod = trimStr(b.shippingMethod, LIMITS.shippingMethod);
  const destRaw = trimStr(b.destinationCountry, LIMITS.destinationCountry);
  const address = trimStr(b.address, LIMITS.address);
  const state = trimStr(b.state, LIMITS.state);
  const city = trimStr(b.city, LIMITS.city);
  const zipRaw = trimStr(b.zipCode, LIMITS.zipCode);
  const zipCode = zipRaw.length > 0 ? zipRaw : "—";

  if (!firstName || !lastName || !phone) {
    return { ok: false, message: "First name, last name, and phone are required." };
  }
  if (!departure || !ALLOW_DEPARTURE.has(departure)) {
    return { ok: false, message: "Select a valid country of departure." };
  }
  if (!category || !ALLOW_CATEGORY.has(category)) {
    return { ok: false, message: "Select a valid item category." };
  }
  if (!description || description.length < 3) {
    return { ok: false, message: "Please enter a short description of your shipment." };
  }
  if (!shippingMethod || !ALLOW_SHIPPING.has(shippingMethod)) {
    return { ok: false, message: "Select a valid shipping method." };
  }
  if (!destRaw || !DESTINATION_CODES.has(destRaw)) {
    return { ok: false, message: "Select a valid destination country." };
  }
  if (!address || !state || !city) {
    return { ok: false, message: "Address, state/region, and city are required." };
  }

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      phone,
      departure,
      category,
      description,
      shippingMethod,
      destinationCountry: destRaw,
      address,
      state,
      city,
      zipCode,
    },
  };
}
