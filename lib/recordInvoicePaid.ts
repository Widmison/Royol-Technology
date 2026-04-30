import type { PrismaClient } from "@prisma/client";
import { allocateMexTrackingId } from "@/lib/trackingId";

export type PaidViaOption = "MONCASH" | "NATCASH" | "CASH";

const includePaid = {
  request: {
    include: {
      client: { select: { id: true, email: true, firstName: true, lastName: true } },
      package: { select: { trackingId: true } },
    },
  },
} as const;

/** Mark invoice paid, ensure package + first timeline event, request → PAID. Idempotent if already PAID. */
export async function recordInvoicePaid(prisma: PrismaClient, invoiceId: string, paidVia: PaidViaOption) {
  const existing = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: includePaid,
  });

  if (!existing) {
    throw new Error("Invoice not found");
  }

  if (existing.status === "PAID") {
    return existing;
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", paidAt: new Date(), paidVia },
  });

  const pkg = await prisma.package.findUnique({
    where: { requestId: existing.requestId },
  });

  if (pkg) {
    await prisma.package.update({
      where: { id: pkg.id },
      data: {
        events: {
          create: {
            status: "PROCESSING",
            location: "Miami Warehouse (Doral, FL)",
            description: "Payment received. Package cleared and preparing for transit.",
          },
        },
      },
    });
  } else {
    const trackingId = await allocateMexTrackingId(prisma);
    await prisma.package.create({
      data: {
        trackingId,
        requestId: existing.requestId,
        status: "PROCESSING",
        events: {
          create: {
            status: "PROCESSING",
            location: "Miami Warehouse (Doral, FL)",
            description: "Payment received. Package registered and preparing for transit.",
          },
        },
      },
    });
  }

  await prisma.shipmentRequest.update({
    where: { id: existing.requestId },
    data: { status: "PAID" },
  });

  const fresh = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: includePaid,
  });

  if (!fresh) throw new Error("Invoice missing after payment");
  return fresh;
}
