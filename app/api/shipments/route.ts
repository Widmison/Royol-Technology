import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const clientId = cookieStore.get("clientId")?.value;

    if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Create the shipment AND link it directly to this user!
    await prisma.shipmentRequest.create({
      data: {
        userId: clientId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        departure: body.departure,
        category: body.category,
        description: body.description,
        status: "PENDING_DROPOFF"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}