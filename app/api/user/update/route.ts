import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApiUser } from "@/lib/requireApiSession";
import { validateClientProfileBody } from "@/lib/clientProfileUpdateValidation";

export async function POST(req: Request) {
  try {
    const userOrRes = await requireClientApiUser();
    if (userOrRes instanceof NextResponse) return userOrRes;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
    }

    const parsed = validateClientProfileBody(raw);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userOrRes.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}