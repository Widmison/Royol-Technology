import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const clientId = cookieStore.get("clientId")?.value;

    if (!clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: clientId } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
