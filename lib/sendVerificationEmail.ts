import { Resend } from "resend";

/**
 * Signup verification — **HTTP API only** (Resend). No SMTP in this app.
 *
 * 1. Create an API key at https://resend.com/api-keys
 * 2. Add `RESEND_API_KEY` to Vercel / `.env`
 * 3. Verify **mex509.com** in Resend (DNS: SPF + DKIM they show you)
 * 4. Set `EMAIL_FROM` to `MEX509 <info@mex509.com>` (or leave unset to use that default)
 *
 * Until your domain is verified, you can temporarily set:
 * `EMAIL_FROM=MEX509 <onboarding@resend.dev>` — Resend’s sandbox sender for tests only.
 */
const DEFAULT_FROM = "MEX509 <info@mex509.com>";

function verificationHtml(code: string) {
  const safe = code.replace(/[^0-9]/g, "");
  return `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h1 style="color:#1D3B8E;font-size:22px;margin:0 0 16px;">Verify your email</h1>
          <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 20px;">
            Use this code to finish creating your MEX509 account. It expires when you request a new one.
          </p>
          <p style="font-size:32px;letter-spacing:0.25em;font-weight:800;color:#111827;margin:0 0 24px;font-family:ui-monospace,monospace;">
            ${safe}
          </p>
          <p style="color:#6B7280;font-size:13px;margin:0;">
            If you did not sign up for MEX509, you can ignore this message.
          </p>
        </div>
      `;
}

export async function sendSignupVerificationEmail(to: string, code: string): Promise<boolean> {
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
      subject: "Your MEX509 verification code",
      html: verificationHtml(code),
    });
    if (error) {
      console.error("[auth] Resend API error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[auth] sendSignupVerificationEmail:", e);
    return false;
  }
}
