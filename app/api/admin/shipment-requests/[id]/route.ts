import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";
import { canPerformStaffCapability } from "@/lib/staffAccess";

/** Delete a pre-registration quote (pending drop-off only). Cascades related invoice/package if any. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApiUser();
  if (admin instanceof NextResponse) return admin;
  if (!canPerformStaffCapability(admin, "quotes:delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing request id." }, { status: 400 });
  }

  const reqRow = await prisma.shipmentRequest.findUnique({
    where: { id },
    include: {
      invoice: true,
      package: true,
    },
  });

  if (!reqRow) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  if (reqRow.status !== "PENDING_DROPOFF") {
    return NextResponse.json(
      { error: "Only pending drop-off quotes can be deleted. Use shipments/invoices for active pipeline items." },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const pkg = reqRow.package;
      if (pkg) {
        await tx.clientExternalTracking.updateMany({
          where: { linkedPackageId: pkg.id },
          data: { linkedPackageId: null },
        });
        await tx.trackingEvent.deleteMany({ where: { packageId: pkg.id } });
        await tx.package.delete({ where: { id: pkg.id } });
      }
      if (reqRow.invoice) {
        await tx.invoice.delete({ where: { id: reqRow.invoice.id } });
      }
      await tx.shipmentRequest.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete shipment request:", e);
    return NextResponse.json({ error: "Could not delete quote." }, { status: 500 });
  }
}
