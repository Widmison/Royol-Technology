import { Resend } from "resend";
import { packageStatusShortLabel, packageStatusTimelineTitle } from "@/lib/packageStatusDisplay";

const DEFAULT_FROM = "MEX509 <info@mex509.com>";

function trackingUpdateHtml(opts: {
  clientName: string;
  trackingId: string;
  location: string;
  statusLabel: string;
  detail: string;
  trackUrl: string;
}) {
  const { clientName, trackingId, location, statusLabel, detail, trackUrl } = opts;
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h1 style="color:#1D3B8E;font-size:20px;margin:0 0 12px;">Shipment update — MEX509</h1>
      <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 8px;">Hello ${escapeHtml(clientName)},</p>
      <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 16px;">
        Your package <strong style="letter-spacing:0.06em;">${escapeHtml(trackingId)}</strong> has a new status update from our team.
      </p>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:16px;margin:0 0 16px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;">Update</p>
        <p style="margin:0 0 4px;font-size:16px;font-weight:800;color:#111827;">${escapeHtml(statusLabel)}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;">${escapeHtml(location)}</p>
        <p style="margin:0;font-size:14px;color:#4B5563;line-height:1.45;">${escapeHtml(detail)}</p>
      </div>
      <p style="margin:0 0 20px;">
        <a href="${escapeAttr(trackUrl)}" style="display:inline-block;background:#EA580C;color:#fff;font-weight:700;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:15px;">View tracking</a>
      </p>
      <p style="color:#9CA3AF;font-size:12px;margin:0;">You receive this email when our warehouse updates your shipment. If you did not expect this, contact info@mex509.com.</p>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function publicSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw.startsWith("http") ? raw : `https://${raw}`).origin;
    } catch {
      /* fall through */
    }
  }
  return "https://mex509.com";
}

/**
 * Notify the client by email when an admin posts a tracking update (scan / manual update).
 * Uses Resend (same stack as signup verification). Returns false if not sent.
 */
export async function sendTrackingUpdateEmail(
  to: string,
  opts: {
    clientName: string;
    trackingId: string;
    location: string;
    /** PackageStatus string */
    status: string;
    description: string;
  }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = (process.env.EMAIL_FROM || DEFAULT_FROM).trim();

  if (!apiKey) {
    console.warn("[tracking] RESEND_API_KEY missing — tracking update email not sent.");
    return false;
  }

  const trackUrl = `${publicSiteOrigin()}/track?id=${encodeURIComponent(opts.trackingId)}`;
  const statusLabel = packageStatusShortLabel(opts.status);
  const detail =
    opts.description.trim() || packageStatusTimelineTitle(opts.status, null) || statusLabel;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: `MEX509 update: ${opts.trackingId} — ${statusLabel}`,
      html: trackingUpdateHtml({
        clientName: opts.clientName,
        trackingId: opts.trackingId,
        location: opts.location,
        statusLabel,
        detail,
        trackUrl,
      }),
    });
    if (error) {
      console.error("[tracking] Resend error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[tracking] sendTrackingUpdateEmail:", e);
    return false;
  }
}
