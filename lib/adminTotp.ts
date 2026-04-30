import { generateSecret, generateURI, verifySync } from "otplib";

export function createTotpSecret(): string {
  return generateSecret();
}

export function buildTotpKeyUri(email: string, secret: string): string {
  return generateURI({
    issuer: "MEX509",
    label: email,
    secret,
  });
}

export function verifyTotpCode(secret: string, token: string): boolean {
  const digits = token.replace(/\D/g, "");
  if (digits.length !== 6) return false;
  const result = verifySync({ secret, token: digits, epochTolerance: 1 });
  return result.valid === true;
}
