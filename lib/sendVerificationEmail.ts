import { Resend } from "resend";

/**
 * Signup + sign-in verification — Resend HTTP API only (no SMTP).
 *
 * Production: set `RESEND_API_KEY`, verify domain in Resend, set `EMAIL_FROM` (e.g. MEX509 <info@mex509.com>).
 * Sandbox: `EMAIL_FROM=MEX509 <onboarding@resend.dev>` for tests.
 */
const DEFAULT_FROM = "MEX509 <info@mex509.com>";

export type ClientVerificationPurpose = "signup" | "signin";

function verificationHtml(purpose: ClientVerificationPurpose, code: string) {
  const safe = code.replace(/[^0-9]/g, "");
  const body =
    purpose === "signup"
      ? `Use this code to finish creating your MEX509 account. It is replaced if you request a new one.`
      : `Use this code to complete your sign-in. It is replaced if you request a new one.`;
  return `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h1 style="color:#1D3B8E;font-size:22px;margin:0 0 16px;">Your verification code</h1>
          <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 20px;">
            ${body}
          </p>
          <p style="font-size:32px;letter-spacing:0.25em;font-weight:800;color:#111827;margin:0 0 24px;font-family:ui-monospace,monospace;">
            ${safe}
          </p>
          <p style="color:#6B7280;font-size:13px;margin:0;">
            If you did not try to sign in or create an account with MEX509, you can ignore this message.
          </p>
        </div>
      `;
}

function subjectFor(purpose: ClientVerificationPurpose): string {
  return purpose === "signup"
    ? "Your MEX509 verification code"
    : "Your MEX509 sign-in code";
}

/**
 * Sends a client portal verification email via Resend.
 * Returns `false` if misconfigured or the API rejected the send.
 */
export async function sendClientVerificationEmail(
  to: string,
  code: string,
  purpose: ClientVerificationPurpose
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = (process.env.EMAIL_FROM || DEFAULT_FROM).trim();

  if (!apiKey) {
    console.warn("[auth] Set RESEND_API_KEY to send verification email (Resend HTTP API — no SMTP).");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: subjectFor(purpose),
      html: verificationHtml(purpose, code),
    });
    if (error) {
      console.error("[auth] Resend API error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[auth] sendClientVerificationEmail:", e);
    return false;
  }
}
