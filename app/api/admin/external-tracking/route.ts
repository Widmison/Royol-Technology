import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";

export async function GET() {
  try {
    const adminOrRes = await requireAdminApiUser();
    if (adminOrRes instanceof NextResponse) return adminOrRes;

    const entries = await prisma.clientExternalTracking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        linkedPackage: {
          select: { id: true, trackingId: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load external tracking entries." }, { status: 500 });
  }
}
