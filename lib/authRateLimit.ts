/**
 * Sliding-window rate limits (best-effort per server instance).
 * For strict global limits at scale, use Vercel Firewall or Upstash Ratelimit.
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX_ATTEMPTS = 25;

const QUOTE_WINDOW_MS = 60_000;
const QUOTE_MAX_ATTEMPTS = 8;

function prune(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

function allowKeyedAttempt(key: string, windowMs: number, maxAttempts: number): boolean {
  const now = Date.now();
  prune(now);
  let e = buckets.get(key);
  if (!e || e.resetAt < now) {
    e = { count: 1, resetAt: now + windowMs };
    buckets.set(key, e);
    return true;
  }
  if (e.count >= maxAttempts) return false;
  e.count += 1;
  return true;
}

/** Login, signup, password reset, admin auth — per IP bucket. */
export function allowAuthAttempt(key: string): boolean {
  return allowKeyedAttempt(key, AUTH_WINDOW_MS, AUTH_MAX_ATTEMPTS);
}

/** Public quote form — tighter cap to reduce spam / DB abuse. */
export function allowQuoteSubmission(ipKey: string): boolean {
  return allowKeyedAttempt(`quote-submit:${ipKey}`, QUOTE_WINDOW_MS, QUOTE_MAX_ATTEMPTS);
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  const ri = req.headers.get("x-real-ip");
  if (ri) return ri.trim();
  return "unknown";
}
