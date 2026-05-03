import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";
import { calculatePickupAutoQuote, estimatePickupDistanceMiles, getPickupRatePerMile } from "@/lib/pickupPricing";
import { isTrustedClientPickupPhotoUrl } from "@/lib/trustedClientBlobUrl";

export async function GET() {
  const clientOrRes = await requireClientApiUser();
  if (clientOrRes instanceof NextResponse) return clientOrRes;

  const pickupRequest = (
    prisma as unknown as {
      pickupRequest: { findMany: (args: unknown) => Promise<unknown[]> };
    }
  ).pickupRequest;
  const rows = await pickupRequest.findMany({
    where: { clientId: clientOrRes.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests: rows });
}

export async function POST(req: Request) {
  const clientOrRes = await requireClientApiUser();
  if (clientOrRes instanceof NextResponse) return clientOrRes;

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : null;
  const state = typeof body.state === "string" ? body.state.trim() : null;
  const zipCode = typeof body.zipCode === "string" ? body.zipCode.trim() : null;
  const packagePhotoUrl = typeof body.packagePhotoUrl === "string" ? body.packagePhotoUrl.trim() : null;

  if (!isTrustedClientPickupPhotoUrl(packagePhotoUrl, clientOrRes.id)) {
    return NextResponse.json(
      { error: "Photo must be uploaded using the portal upload button (trusted storage only)." },
      { status: 400 }
    );
  }

  if (!name || !phone || !address) {
    return NextResponse.json({ error: "Name, phone, and address are required." }, { status: 400 });
  }

  const distanceMiles = estimatePickupDistanceMiles({ address, city, state, zipCode });
  const pricePerMile = getPickupRatePerMile();
  const autoTotalAmount = calculatePickupAutoQuote(distanceMiles, pricePerMile);

  const pickupRequest = (
    prisma as unknown as {
      pickupRequest: { create: (args: unknown) => Promise<unknown> };
    }
  ).pickupRequest;
  const row = await pickupRequest.create({
    data: {
      clientId: clientOrRes.id,
      name,
      phone,
      address,
      city,
      state,
      zipCode,
      packagePhotoUrl,
      originLabel: "Miami Warehouse",
      destinationLabel: [city, state].filter(Boolean).join(", ") || address,
      distanceMiles,
      pricePerMile,
      autoTotalAmount,
      finalQuotedAmount: autoTotalAmount,
      status: "PENDING",
    },
  });

  return NextResponse.json({ request: row }, { status: 201 });
}
