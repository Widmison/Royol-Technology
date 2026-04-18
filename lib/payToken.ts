import { createHmac, timingSafeEqual } from "crypto";

/** HMAC secret for confirming “mark paid” came from a server-rendered /pay/[id] page. */
function paymentSecret(): string | null {
  const s = process.env.MEX509_PAYMENT_SECRET?.trim();
  return s || null;
}

export function createInvoicePaymentToken(invoiceId: string): string {
  const secret = paymentSecret();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MEX509_PAYMENT_SECRET must be set in production");
    }
    return "";
  }
  return createHmac("sha256", secret).update(`pay:${invoiceId}`).digest("base64url");
}

export function verifyInvoicePaymentToken(invoiceId: string, token: string | undefined | null): boolean {
  const secret = paymentSecret();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token || !invoiceId) return false;
  const expected = createHmac("sha256", secret).update(`pay:${invoiceId}`).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(token));
  return a.length === b.length && timingSafeEqual(a, b);
}
