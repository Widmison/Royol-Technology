import { Resend } from "resend";
import { escapeAttr, escapeHtml } from "@/lib/emailEscape";
import { mex509AdminNotifyEmail } from "@/lib/mex509AdminNotify";

const DEFAULT_FROM = "MEX509 <info@mex509.com>";

function notifyHtml(opts: { title: string; intro: string; detailLines: string[]; buttonLabel?: string; buttonUrl?: string }) {
  const lines = opts.detailLines.map((l) => `<li style="margin:6px 0;color:#374151;font-size:14px;">${escapeHtml(l)}</li>`).join("");
  const btn =
    opts.buttonLabel && opts.buttonUrl
      ? `<p style="margin:20px 0 0;"><a href="${escapeAttr(opts.buttonUrl)}" style="display:inline-block;background:#EA580C;color:#fff;font-weight:700;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:15px;">${escapeHtml(opts.buttonLabel)}</a></p>`
      : "";
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h1 style="color:#1D3B8E;font-size:18px;margin:0 0 12px;">${escapeHtml(opts.title)}</h1>
      <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 16px;">${escapeHtml(opts.intro)}</p>
      <ul style="margin:0;padding-left:18px;">${lines}</ul>
      ${btn}
      <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0;">MEX509 — Haiti · Dominican Republic · USA logistics</p>
    </div>
  `;
}

export async function sendTransactionalEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = (process.env.EMAIL_FROM || DEFAULT_FROM).trim();
  if (!apiKey || !to) return false;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject, html });
    return true;
  } catch (e) {
    console.error("[email]", e);
    return false;
  }
}

export async function sendExternalTrackingSubmittedEmails(opts: {
  clientEmail: string;
  clientName: string;
  trackingNumber: string;
  storeLabel?: string | null;
  dashboardUrl: string;
}) {
  const adminEmail = mex509AdminNotifyEmail();
  const detail = [
    `Tracking / reference: ${opts.trackingNumber}`,
    opts.storeLabel ? `Store / seller: ${opts.storeLabel}` : "",
    `Client: ${opts.clientName}`,
    `Email: ${opts.clientEmail}`,
  ].filter(Boolean) as string[];

  await sendTransactionalEmail(
    adminEmail,
    `[MEX509] Client added external tracking: ${opts.trackingNumber}`,
    notifyHtml({
      title: "New external tracking number",
      intro: "A client registered a third-party ecommerce tracking number in the portal.",
      detailLines: detail,
      buttonLabel: "Review in admin",
      buttonUrl: `${opts.dashboardUrl.replace(/\/$/, "")}/admin/external-tracking`,
    })
  );

  await sendTransactionalEmail(
    opts.clientEmail,
    `We received your tracking number (${opts.trackingNumber})`,
    notifyHtml({
      title: "Tracking number received",
      intro: `Hi ${opts.clientName}, we logged your external tracking details. Our team may link it to your MEX509 shipments when applicable.`,
      detailLines: [`Reference: ${opts.trackingNumber}`, ...(opts.storeLabel ? [`Store: ${opts.storeLabel}`] : [])],
      buttonLabel: "Open client dashboard",
      buttonUrl: opts.dashboardUrl,
    })
  );
}

export async function sendExternalTrackingUpdateEmails(opts: {
  clientEmail: string;
  clientName: string;
  trackingNumber: string;
  title: string;
  message: string;
  dashboardUrl: string;
}) {
  await sendTransactionalEmail(
    opts.clientEmail,
    `[MEX509] ${opts.title}`,
    notifyHtml({
      title: opts.title,
      intro: `Hi ${opts.clientName},`,
      detailLines: [opts.message, `Reference: ${opts.trackingNumber}`],
      buttonLabel: "View dashboard",
      buttonUrl: opts.dashboardUrl,
    })
  );

  await sendTransactionalEmail(
    mex509AdminNotifyEmail(),
    `[MEX509] External tracking update logged: ${opts.trackingNumber}`,
    notifyHtml({
      title: "External tracking update",
      intro: "An update was recorded for a client external tracking entry (client was notified).",
      detailLines: [`${opts.title}: ${opts.message}`, `Tracking ref: ${opts.trackingNumber}`, `Client: ${opts.clientEmail}`],
      buttonLabel: "Admin — external tracking",
      buttonUrl: `${opts.dashboardUrl.replace(/\/$/, "")}/admin/external-tracking`,
    })
  );
}

/** Welcome email sent once client verifies account during signup flow. */
export async function sendClientWelcomeEmail(opts: {
  to: string;
  firstName?: string | null;
  referralCode?: string | null;
  portalUrl: string;
}) {
  const name = opts.firstName?.trim() || "there";
  let origin = "https://portal.mex509.com";
  try {
    origin = new URL(opts.portalUrl).origin;
  } catch {
    /* use default */
  }
  const imgDelivery = `${origin}/marketing/promo-delivery-services.png`;
  const imgBranding = `${origin}/marketing/branding-container.png`;

  const detailLines = [
    "Use your personal US (Miami) address exactly as shown under Profile in the client portal.",
    "When you shop online, copy your name, phone, and warehouse line so we can match every package.",
    opts.referralCode ? `Your referral code: ${opts.referralCode} — share it at signup so friends can join you on MEX509.` : "",
  ].filter(Boolean) as string[];

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:0;">
      <div style="background:linear-gradient(135deg,#1D3B8E 0%,#0f1f4a 100%);padding:28px 24px;border-radius:12px 12px 0 0;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#FDBA74;">MEX509</p>
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;line-height:1.25;">Welcome aboard</h1>
        <p style="margin:10px 0 0;font-size:14px;font-weight:500;color:#c7d2fe;line-height:1.5;">Your portal is live — pre-register boxes, pay invoices, and follow tracking in one place.</p>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #E5E7EB;border-top:0;border-radius:0 0 12px 12px;">
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi <strong style="color:#111827;">${escapeHtml(name)}</strong>, thank you for choosing MEX509. We are glad you are here.</p>
        <ul style="margin:0 0 18px;padding-left:18px;">
          ${detailLines.map((line) => `<li style="margin:8px 0;color:#4B5563;font-size:14px;line-height:1.5;">${escapeHtml(line)}</li>`).join("")}
        </ul>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin:8px 0 20px;">
          <div style="flex:1;min-width:200px;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#F9FAFB;">
            <img src="${escapeAttr(imgDelivery)}" alt="Delivery" width="280" height="160" style="display:block;width:100%;height:auto;"/>
            <p style="margin:0;padding:8px 10px;font-size:11px;font-weight:700;color:#6B7280;">Shopping online: use the warehouse address from your profile.</p>
          </div>
          <div style="flex:1;min-width:200px;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#F9FAFB;">
            <img src="${escapeAttr(imgBranding)}" alt="Your MEX address" width="280" height="160" style="display:block;width:100%;height:auto;"/>
            <p style="margin:0;padding:8px 10px;font-size:11px;font-weight:700;color:#6B7280;">Keep your name + phone on the label for fast matching.</p>
          </div>
        </div>
        <div style="padding:14px 16px;border:1px dashed #FDBA74;border-radius:10px;background:#FFFBF5;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:800;color:#9A3412;text-transform:uppercase;letter-spacing:0.08em;">Checkout copy — example</p>
          <p style="margin:0;font-size:12px;line-height:1.65;font-family:ui-monospace,monospace;color:#1F2937;">FULL NAME<br/>+509 XX XX XXXX<br/>1962 NW 82nd Ave<br/>Doral, FL 33191 — UNIT / APT<br/>USA</p>
        </div>
        <p style="margin:24px 0 0;">
          <a href="${escapeAttr(opts.portalUrl)}" style="display:inline-block;background:#EA580C;color:#fff;font-weight:800;padding:14px 22px;border-radius:10px;text-decoration:none;font-size:15px;box-shadow:0 4px 14px rgba(234,88,12,0.35);">Open my dashboard</a>
        </p>
        <p style="color:#9CA3AF;font-size:11px;margin:20px 0 0;line-height:1.4;">MEX509 — US · DR · HT logistics. Questions? Reply to this message or use WhatsApp on mex509.com.</p>
      </div>
    </div>
  `;

  await sendTransactionalEmail(
    opts.to,
    "Welcome to MEX509 — your US address & portal are ready",
    html
  );
}

export function paidViaHumanLabel(code: string): string {
  switch (code) {
    case "MONCASH":
      return "MonCash";
    case "NATCASH":
      return "NatCash";
    case "CASH":
      return "Cash at office";
    case "CARD":
      return "Card";
    default:
      return code;
  }
}

/** Client + ops inbox when staff records payment in Admin. */
export async function sendInvoicePaymentRecordedEmails(opts: {
  invoiceId: string;
  amountUsd: number;
  paidVia: string;
  clientName: string;
  clientEmail: string | null;
  trackingId: string | null;
  portalUrl: string;
  adminUrl: string;
}) {
  const via = paidViaHumanLabel(opts.paidVia);
  const detailOps = [
    `Client: ${opts.clientName}`,
    `Amount: $${opts.amountUsd.toFixed(2)}`,
    `Recorded method: ${via}`,
    opts.trackingId ? `MEX tracking: ${opts.trackingId}` : "Tracking: check package row after payment",
    `Invoice: ${opts.invoiceId}`,
  ];

  await sendTransactionalEmail(
    mex509AdminNotifyEmail(),
    `[MEX509 Ops] Payment recorded · $${opts.amountUsd.toFixed(2)} · ${via}`,
    notifyHtml({
      title: "Invoice marked paid",
      intro: "Staff confirmed this payment in the admin dashboard.",
      detailLines: detailOps,
      buttonLabel: "Open invoices",
      buttonUrl: `${opts.adminUrl.replace(/\/$/, "")}/admin/invoices`,
    })
  );

  if (opts.clientEmail) {
    await sendTransactionalEmail(
      opts.clientEmail,
      `MEX509 — We received your payment ($${opts.amountUsd.toFixed(2)})`,
      notifyHtml({
        title: "Payment received",
        intro: `Hi ${opts.clientName}, we've recorded your payment and your shipment can move forward.`,
        detailLines: [
          `Amount: $${opts.amountUsd.toFixed(2)}`,
          `Method on file: ${via}`,
          ...(opts.trackingId ? [`Your MEX tracking number: ${opts.trackingId}`] : ["Your tracking number will appear on your invoice page once assigned."]),
        ],
        buttonLabel: "Open payment / tracking",
        buttonUrl: `${opts.portalUrl.replace(/\/$/, "")}/pay/${opts.invoiceId}`,
      })
    );
  }
}

/** Internal ops copy when warehouse scans / updates tracking (in addition to client email). */
export async function sendTrackingScanOpsEmail(opts: {
  trackingId: string;
  statusLabel: string;
  location: string;
  detail: string;
  clientEmail: string | null;
  adminUrl: string;
}) {
  await sendTransactionalEmail(
    mex509AdminNotifyEmail(),
    `[MEX509 Ops] Scan · ${opts.trackingId} — ${opts.statusLabel}`,
    notifyHtml({
      title: "Warehouse tracking update",
      intro: "A staff scan or status update was saved in the system.",
      detailLines: [
        `Tracking: ${opts.trackingId}`,
        `Status: ${opts.statusLabel}`,
        `Location: ${opts.location}`,
        opts.detail,
        opts.clientEmail ? `Client email: ${opts.clientEmail}` : "No portal email on file",
      ],
      buttonLabel: "Scanner hub",
      buttonUrl: `${opts.adminUrl.replace(/\/$/, "")}/admin/scan`,
    })
  );
}
