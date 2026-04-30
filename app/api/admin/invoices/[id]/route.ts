import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApiUser } from "@/lib/requireApiSession";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireSuperAdminApiUser();
  if (admin instanceof NextResponse) return admin;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing invoice id." }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { request: { include: { package: true } } },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const pkg = invoice.request.package;
      if (pkg) {
        await tx.clientExternalTracking.updateMany({
          where: { linkedPackageId: pkg.id },
          data: { linkedPackageId: null },
        });
        await tx.trackingEvent.deleteMany({ where: { packageId: pkg.id } });
        await tx.package.delete({ where: { id: pkg.id } });
      }

      await tx.invoice.delete({ where: { id: invoice.id } });
      await tx.shipmentRequest.update({
        where: { id: invoice.requestId },
        data: { status: "PENDING_DROPOFF" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete invoice:", e);
    return NextResponse.json({ error: "Could not delete invoice." }, { status: 500 });
  }
}
