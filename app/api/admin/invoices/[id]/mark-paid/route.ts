import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runInvoicePaidNotifications } from "@/lib/invoicePaidNotifications";
import { recordInvoicePaid, type PaidViaOption } from "@/lib/recordInvoicePaid";
import { requireAdminApiUser } from "@/lib/requireApiSession";
import { canPerformStaffCapability } from "@/lib/staffAccess";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminOrRes = await requireAdminApiUser();
  if (adminOrRes instanceof NextResponse) return adminOrRes;
  if (!canPerformStaffCapability(adminOrRes, "invoices:mark-paid")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing invoice id." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = typeof body.paidVia === "string" ? body.paidVia.trim().toUpperCase() : "";
  const paidVia: PaidViaOption =
    raw === "NATCASH" || raw === "MONCASH" || raw === "CASH" ? raw : "CASH";

  try {
    const prior = await prisma.invoice.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!prior) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    if (prior.status === "PAID") {
      return NextResponse.json({ error: "This invoice is already marked paid." }, { status: 409 });
    }

    const invoice = await recordInvoicePaid(prisma, id, paidVia);

    await runInvoicePaidNotifications(invoice);

    return NextResponse.json({
      ok: true,
      invoiceId: invoice.id,
      trackingId: invoice.request.package?.trackingId ?? null,
    });
  } catch (e) {
    console.error("[mark-paid]", e);
    return NextResponse.json({ error: "Could not record payment." }, { status: 500 });
  }
}
