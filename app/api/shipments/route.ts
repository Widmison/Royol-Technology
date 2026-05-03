import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";
import { validateClientPortalShipmentBody } from "@/lib/clientPortalShipmentValidation";

export async function POST(req: Request) {
  try {
    const userOrRes = await requireClientApiUser();
    if (userOrRes instanceof NextResponse) return userOrRes;
    const user = userOrRes;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
    }

    const b = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    const merged = {
      ...b,
      firstName:
        typeof b.firstName === "string" && b.firstName.trim() !== ""
          ? b.firstName
          : (user.firstName ?? ""),
      lastName:
        typeof b.lastName === "string" && b.lastName.trim() !== "" ? b.lastName : (user.lastName ?? ""),
      phone:
        typeof b.phone === "string" && b.phone.trim() !== "" ? b.phone : (user.phone ?? "Not provided"),
    };

    const parsed = validateClientPortalShipmentBody(merged);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }
    const d = parsed.data;

    await prisma.shipmentRequest.create({
      data: {
        clientId: user.id,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        departure: d.departure,
        category: d.category,
        description: d.description,
        shippingMethod: d.shippingMethod,
        destinationCountry: d.destinationCountry,
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
