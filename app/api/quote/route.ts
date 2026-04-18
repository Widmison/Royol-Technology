import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allowAuthAttempt, clientIp } from "@/lib/authRateLimit";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!allowAuthAttempt(`quote:${ip}`)) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }

    // 1. Grab the data from the frontend form
    const body = await req.json();

    // 2. Save it directly to our Supabase PostgreSQL database!
    const newRequest = await prisma.shipmentRequest.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        departure: body.departure,
        category: body.category,
        description: body.description,
        shippingMethod: body.shippingMethod,
        destinationCountry: body.destinationCountry || null,
        address: body.address,
        state: body.state,
        city: body.city,
        zipCode: (body.zipCode && String(body.zipCode).trim()) || "—",
      },
    });

    // 3. Tell the frontend it was successful
    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
    
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to submit quote to database" }, { status: 500 });
  }
}