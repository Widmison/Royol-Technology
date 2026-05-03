const L = {
  firstName: 80,
  lastName: 80,
  phone: 40,
  address: 300,
  city: 120,
  state: 80,
  zipCode: 24,
} as const;

function s(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export type ClientProfileValidated = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

export function validateClientProfileBody(
  raw: unknown
): { ok: true; data: ClientProfileValidated } | { ok: false; message: string } {
  if (raw === null || typeof raw !== "object") {
    return { ok: false, message: "Invalid JSON body." };
  }
  const b = raw as Record<string, unknown>;
  const firstName = s(b.firstName, L.firstName);
  const lastName = s(b.lastName, L.lastName);
  const phone = s(b.phone, L.phone);
  const address = s(b.address, L.address);
  const city = s(b.city, L.city);
  const state = s(b.state, L.state);
  const zipCode = s(b.zipCode, L.zipCode);

  if (!firstName || !lastName) return { ok: false, message: "First and last name are required." };
  if (!phone) return { ok: false, message: "Phone is required." };

  return {
    ok: true,
    data: { firstName, lastName, phone, address, city, state, zipCode },
  };
}
