import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allowQuoteSubmission, clientIp } from "@/lib/authRateLimit";
import { validateQuoteRequestBody } from "@/lib/quoteRequestValidation";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!allowQuoteSubmission(ip)) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
    }

    const parsed = validateQuoteRequestBody(raw);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }
    const body = parsed.data;

    const row = await prisma.shipmentRequest.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        departure: body.departure,
        category: body.category,
        description: body.description,
        shippingMethod: body.shippingMethod,
        destinationCountry: body.destinationCountry,
        address: body.address,
        state: body.state,
        city: body.city,
        zipCode: body.zipCode,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json({ error: "Could not save your request. Try again later." }, { status: 500 });
  }
}
