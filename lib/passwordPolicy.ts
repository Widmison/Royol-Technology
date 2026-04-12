/** Rules for new account passwords (enforced on the server; mirrored in the UI). */
export const SIGNUP_PASSWORD_RULES_TEXT =
  "Use at least 10 characters including uppercase, lowercase, a number, and a symbol.";

export type SignupPasswordRuleKey = "length" | "upper" | "lower" | "digit" | "symbol";

export function signupPasswordRuleChecks(password: string): Record<SignupPasswordRuleKey, boolean> {
  return {
    length: password.length >= 10 && password.length <= 128,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

/** `null` if valid; otherwise a single user-facing error. */
export function validateSignupPassword(password: unknown): string | null {
  if (typeof password !== "string") return "Password is required.";
  if (password.length > 128) return "Password must be at most 128 characters.";
  const checks = signupPasswordRuleChecks(password);
  if (!checks.length) return "Password must be at least 10 characters.";
  if (!checks.upper) return "Password must include at least one uppercase letter.";
  if (!checks.lower) return "Password must include at least one lowercase letter.";
  if (!checks.digit) return "Password must include at least one number.";
  if (!checks.symbol) return "Password must include at least one symbol (for example ! @ # $ %).";
  return null;
}
