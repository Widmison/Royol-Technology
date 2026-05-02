/**
 * Normalize signup/login phone input for WhatsApp (Twilio expects whatsapp:+E.164).
 */
export function normalizeClientPhoneForWhatsApp(raw: string): string | null {
  const t = raw.trim();
  if (/^\+\d{10,15}$/.test(t)) return t;

  const d = raw.replace(/\D/g, "");
  if (!d.length) return null;

  // US / Canada: 10 digits → +1
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;

  // Haiti local mobile (8 digits, no leading 0)
  if (d.length === 8) return `+509${d}`;

  // Already includes 509 prefix (11 digits)
  if (d.startsWith("509") && d.length >= 11) return `+${d}`;

  return null;
}

export function maskPhoneTail(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const tail = digits.slice(-4);
  return tail.length === 4 ? `••••${tail}` : "••••••••";
}
