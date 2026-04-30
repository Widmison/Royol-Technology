import { escapeHtml } from "@/lib/emailEscape";
import { sendTransactionalEmail } from "@/lib/sendNotificationEmails";

export async function sendAdminSignInOtpEmail(to: string, code: string): Promise<boolean> {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h1 style="color:#1D3B8E;font-size:18px;margin:0 0 12px;">MEX509 admin sign-in code</h1>
      <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 16px;">
        Use this code to finish signing in. It expires in 15 minutes.
      </p>
      <p style="font-size:28px;font-weight:800;letter-spacing:0.2em;color:#111827;margin:16px 0;">${escapeHtml(code)}</p>
      <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0;">If you didn’t try to sign in, ignore this email.</p>
    </div>
  `;
  return sendTransactionalEmail(to, `[MEX509] Admin sign-in code: ${code}`, html);
}
