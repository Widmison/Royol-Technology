import { QUOTE_SHIPPING_METHODS_SET } from "@/lib/quoteRequestValidation";

/**
 * Matches `components/DashboardNewBox.tsx` drop-off selectors + legacy quote departure codes.
 */
const CLIENT_DROP_OFF_SITES = new Set([
  "Miami Warehouse",
  "Orlando Warehouse",
  "Atlanta Warehouse",
  "Santo Domingo Warehouse",
  "Santiago Warehouse",
  "Puerto Plata Warehouse",
  "La Romana Warehouse",
  "USA",
  "DR",
  "China",
]);

/** Matches `DashboardNewBox` category `<select>` options. */
const CLIENT_BOX_CATEGORIES = new Set([
  "Standard Box",
  "Electronics",
  "Pallet / Freight",
  "Vehicle Parts",
]);

const L = {
  firstName: 80,
  lastName: 80,
  phone: 40,
  departure: 48,
  category: 48,
  description: 4000,
  shippingMethod: 48,
} as const;

function trim(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export type ClientPortalShipmentBody = {
  firstName: string;
  lastName: string;
  phone: string;
  departure: string;
  category: string;
  description: string;
  shippingMethod: string;
  destinationCountry: "HT" | "DO";
};

export function validateClientPortalShipmentBody(
  raw: unknown
): { ok: true; data: ClientPortalShipmentBody } | { ok: false; message: string } {
  if (raw === null || typeof raw !== "object") {
    return { ok: false, message: "Invalid JSON body." };
  }
  const b = raw as Record<string, unknown>;

  const firstName = trim(b.firstName, L.firstName);
  const lastName = trim(b.lastName, L.lastName);
  const phone = trim(b.phone, L.phone);
  const departure = trim(b.departure, L.departure) || "Miami Warehouse";
  const category = trim(b.category, L.category) || "Standard Box";
  const description = trim(b.description, L.description) || "—";
  const shippingMethod = trim(b.shippingMethod, L.shippingMethod) || "Air Freight";
  const destRaw =
    typeof b.destinationCountry === "string" ? b.destinationCountry.trim().toUpperCase() : "";
  const destinationCountry: "HT" | "DO" = destRaw === "DO" ? "DO" : "HT";

  if (!firstName || !lastName) {
    return { ok: false, message: "First and last name are required on your profile or in the request." };
  }
  if (!phone) {
    return { ok: false, message: "Phone is required." };
  }
  if (!CLIENT_DROP_OFF_SITES.has(departure)) {
    return { ok: false, message: "Select a valid drop-off location." };
  }
  if (!CLIENT_BOX_CATEGORIES.has(category)) {
    return { ok: false, message: "Select a valid item category." };
  }
  if (!QUOTE_SHIPPING_METHODS_SET.has(shippingMethod)) {
    return { ok: false, message: "Select a valid shipping method." };
  }
  if (description !== "—" && description.length > 0 && description.length < 3) {
    return { ok: false, message: "Description must be at least 3 characters, or leave it blank." };
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
      destinationCountry,
    },
  };
}
