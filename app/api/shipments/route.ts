import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";

export async function POST(req: Request) {
  try {
    const userOrRes = await requireClientApiUser();
    if (userOrRes instanceof NextResponse) return userOrRes;
    const user = userOrRes;

    const body = await req.json();

    const firstName = (body.firstName as string)?.trim() || user.firstName || "";
    const lastName = (body.lastName as string)?.trim() || user.lastName || "";
    const phone = (body.phone as string)?.trim() || user.phone || "Not provided";

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required on your profile or in the request." },
        { status: 400 }
      );
    }

    const destRaw = typeof body.destinationCountry === "string" ? body.destinationCountry.trim().toUpperCase() : "";
    const destinationCountry =
      destRaw === "DO" ? "DO" : "HT";

    await prisma.shipmentRequest.create({
      data: {
        clientId: user.id,
        firstName,
        lastName,
        phone,
        departure: (body.departure as string) || "Miami Warehouse",
        category: (body.category as string) || "Standard Box",
        description: ((body.description as string) || "").trim() || "—",
        shippingMethod: (body.shippingMethod as string)?.trim() || "Air Freight",
        destinationCountry,
        address: user.address?.trim() || "—",
        state: user.state?.trim() || "—",
        city: user.city?.trim() || "—",
        zipCode: user.zipCode?.trim() || "—",
        status: "PENDING_DROPOFF",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}
