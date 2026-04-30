import { pushStaffNotification, pushUserNotification } from "@/lib/pushAppNotification";
import { paidViaHumanLabel, sendInvoicePaymentRecordedEmails } from "@/lib/sendNotificationEmails";
import { getAdminPortalUrl, getPortalSiteUrl } from "@/lib/siteUrl";

/** After staff records payment — bell on admin + client portal, emails to ops + client. */
export async function runInvoicePaidNotifications(invoice: {
  id: string;
  totalAmount: number;
  paidVia: string | null;
  request: {
    firstName: string;
    lastName: string;
    clientId: string | null;
    client: { email: string } | null;
    package: { trackingId: string } | null;
  };
}) {
  const clientName = `${invoice.request.firstName} ${invoice.request.lastName}`.trim() || "Customer";
  const trackingId = invoice.request.package?.trackingId ?? null;
  const viaLabel = paidViaHumanLabel(invoice.paidVia ?? "CASH");

  await pushStaffNotification({
    type: "INVOICE_PAID_STAFF",
    title: `Payment recorded · $${invoice.totalAmount.toFixed(2)}`,
    body: `${clientName} — ${viaLabel}${trackingId ? ` · ${trackingId}` : ""}`,
    link: `/admin/invoices`,
  });

  const cid = invoice.request.clientId;
  if (cid) {
    await pushUserNotification(cid, {
      type: "INVOICE_PAID",
      title: `Payment received · $${invoice.totalAmount.toFixed(2)}`,
      body: trackingId
        ? `Your shipment ${trackingId} is cleared financially — we're processing your cargo.`
        : "We've recorded your payment — your shipment can move forward.",
      link: `/pay/${invoice.id}`,
    });
  }

  await sendInvoicePaymentRecordedEmails({
    invoiceId: invoice.id,
    amountUsd: invoice.totalAmount,
    paidVia: invoice.paidVia ?? "CASH",
    clientName,
    clientEmail: invoice.request.client?.email ?? null,
    trackingId,
    portalUrl: getPortalSiteUrl(),
    adminUrl: getAdminPortalUrl(),
  });
}
