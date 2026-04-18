import { Resend } from "resend";

const DEFAULT_FROM = "MEX509 <info@mex509.com>";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resetCodeHtml(code: string, loginUrl: string | null) {
  const safe = code.replace(/[^0-9]/g, "");
  const linkLine = loginUrl
    ? `<p style="color:#6B7280;font-size:13px;margin:16px 0 0;line-height:1.5;">
        Open your portal and finish reset on the same screen where you requested it:
        <a href="${escapeHtml(loginUrl)}" style="color:#1D3B8E;font-weight:700;">${escapeHtml(loginUrl)}</a>
      </p>`
    : "";

  return `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h1 style="color:#1D3B8E;font-size:22px;margin:0 0 16px;">Reset your password</h1>
          <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 20px;">
            Enter this code where you set your new password. It expires in one hour.
          </p>
          <p style="font-size:32px;letter-spacing:0.25em;font-weight:800;color:#111827;margin:0 0 24px;font-family:ui-monospace,monospace;">
            ${escapeHtml(safe)}
          </p>
          ${linkLine}
          <p style="color:#6B7280;font-size:13px;margin:16px 0 0;">
            If you did not request this, you can ignore this email.
          </p>
        </div>
      `;
}

/** Public site / portal URL for optional link in email (no trailing slash). */
function portalOrigin(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_PORTAL_URL?.trim() ||
    (process.env.MEX509_PORTAL_HOST?.trim()
      ? `https://${process.env.MEX509_PORTAL_HOST.trim()}`
      : "");
  if (!raw) return null;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return u.origin;
  } catch {
    return null;
  }
}

/** Sends the 6-digit reset code (same digits the user enters on “Set a new password”). */
export async function sendPasswordResetEmail(to: string, resetCode: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = (process.env.EMAIL_FROM || DEFAULT_FROM).trim();
  const origin = portalOrigin();
  const loginUrl = origin ? `${origin}/login` : null;

  if (!apiKey) {
    console.warn("[auth] RESEND_API_KEY missing — password reset email not sent.");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: "Your MEX509 password reset code",
      html: resetCodeHtml(resetCode, loginUrl),
    });
    if (error) {
      console.error("[auth] Resend password reset error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[auth] sendPasswordResetEmail:", e);
    return false;
  }
}
