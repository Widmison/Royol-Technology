/**
 * Transactional OTP via WhatsApp — Twilio WhatsApp API (HTTP, no SDK).
 *
 * Env (all required when using WhatsApp delivery):
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_FROM — e.g. whatsapp:+14155238886 (sandbox) or your approved sender
 *
 * https://www.twilio.com/docs/whatsapp/tutorial/connect-number-business-profile
 */
export function isWhatsAppOtpConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  return !!(sid && token && from);
}

export async function sendClientVerificationWhatsApp(toE164: string, code: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  if (!sid || !token || !from) return false;

  const digits = code.replace(/\D/g, "").slice(0, 6);
  const body = `MEX509 — your verification code is ${digits}. Never share this code. Reply STOP to opt out of messages.`;

  const toWhatsApp = toE164.startsWith("+") ? `whatsapp:${toE164}` : `whatsapp:+${toE164.replace(/\D/g, "")}`;

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({
    From: from,
    To: toWhatsApp,
    Body: body,
  });

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[whatsapp otp] Twilio error:", res.status, errText);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[whatsapp otp]", e);
    return false;
  }
}
