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
