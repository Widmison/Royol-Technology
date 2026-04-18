import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allocateMexTrackingId } from "@/lib/trackingId";
import { verifyInvoicePaymentToken } from "@/lib/payToken";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const invoiceId = formData.get("invoiceId") as string;
    const payTokenRaw = formData.get("payToken");
    const payToken = typeof payTokenRaw === "string" ? payTokenRaw : "";
    const paidViaRaw = (formData.get("paidVia") as string) || "CARD";
    const paidVia = ["CARD", "NATCASH", "MONCASH"].includes(paidViaRaw) ? paidViaRaw : "CARD";

    if (!invoiceId) throw new Error("Missing Invoice ID");

    if (!verifyInvoicePaymentToken(invoiceId, payToken)) {
      return NextResponse.json({ error: "Invalid or expired payment confirmation." }, { status: 403 });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { request: true },
    });

    if (!existingInvoice) throw new Error("Invoice not found");

    if (existingInvoice.status === "PAID") {
      return NextResponse.redirect(new URL(`/pay/${invoiceId}`, req.url), 303);
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date(), paidVia },
      include: { request: true },
    });

    const pkg = await prisma.package.findUnique({
      where: { requestId: invoice.requestId },
    });

    if (pkg) {
      await prisma.package.update({
        where: { id: pkg.id },
        data: {
          events: {
            create: {
              status: "PROCESSING",
              location: "Miami Warehouse (Doral, FL)",
              description:
                "Payment received. Package cleared and preparing for transit.",
            },
          },
        },
      });
    } else {
      const trackingId = await allocateMexTrackingId(prisma);
      await prisma.package.create({
        data: {
          trackingId,
          requestId: invoice.requestId,
          status: "PROCESSING",
          events: {
            create: {
              status: "PROCESSING",
              location: "Miami Warehouse (Doral, FL)",
              description:
                "Payment received. Package registered and preparing for transit.",
            },
          },
        },
      });
    }

    await prisma.shipmentRequest.update({
      where: { id: invoice.requestId },
      data: { status: "PAID" },
    });

    return NextResponse.redirect(new URL(`/pay/${invoiceId}`, req.url), 303);
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
