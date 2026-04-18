/**
 * Simple sliding-window rate limit for auth routes (best-effort per server instance).
 * For strict global limits at scale, use Upstash/Vercel Firewall.
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 25;

function prune(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

/** Returns true if the request should be allowed. */
export function allowAuthAttempt(key: string): boolean {
  const now = Date.now();
  prune(now);
  let e = buckets.get(key);
  if (!e || e.resetAt < now) {
    e = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(key, e);
    return true;
  }
  if (e.count >= MAX_ATTEMPTS) return false;
  e.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  const ri = req.headers.get("x-real-ip");
  if (ri) return ri.trim();
  return "unknown";
}
