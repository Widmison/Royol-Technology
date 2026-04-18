import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";

export async function POST(req: Request) {
  try {
    const userOrRes = await requireClientApiUser();
    if (userOrRes instanceof NextResponse) return userOrRes;

    const body = await req.json();

    // Update the user in the database
    await prisma.user.update({
      where: { id: userOrRes.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}