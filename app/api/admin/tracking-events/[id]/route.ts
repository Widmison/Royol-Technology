import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApiUser } from "@/lib/requireApiSession";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireSuperAdminApiUser();
  if (admin instanceof NextResponse) return admin;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing tracking event id." }, { status: 400 });
  }

  const existing = await prisma.trackingEvent.findUnique({
    where: { id },
    select: { id: true, packageId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Tracking event not found." }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.trackingEvent.delete({ where: { id } });
      const latest = await tx.trackingEvent.findFirst({
        where: { packageId: existing.packageId },
        orderBy: { date: "desc" },
        select: { status: true },
      });
      await tx.package.update({
        where: { id: existing.packageId },
        data: { status: latest?.status ?? "PROCESSING" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete tracking event:", e);
    return NextResponse.json({ error: "Could not delete tracking event." }, { status: 500 });
  }
}
