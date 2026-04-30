import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApiUser } from "@/lib/requireApiSession";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireSuperAdminApiUser();
  if (admin instanceof NextResponse) return admin;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing package id." }, { status: 400 });
  }

  const pkg = await prisma.package.findUnique({
    where: { id },
    include: { request: { include: { invoice: true } } },
  });
  if (!pkg) {
    return NextResponse.json({ error: "Package not found." }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.clientExternalTracking.updateMany({
        where: { linkedPackageId: pkg.id },
        data: { linkedPackageId: null },
      });
      await tx.trackingEvent.deleteMany({ where: { packageId: pkg.id } });
      await tx.package.delete({ where: { id: pkg.id } });
      if (pkg.request.invoice) {
        await tx.invoice.delete({ where: { id: pkg.request.invoice.id } });
      }
      await tx.shipmentRequest.update({
        where: { id: pkg.requestId },
        data: { status: "PENDING_DROPOFF" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete package:", e);
    return NextResponse.json({ error: "Could not delete package." }, { status: 500 });
  }
}
