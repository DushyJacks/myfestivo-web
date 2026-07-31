/**
 * rate-limiter.ts — Netlify Edge Function
 *
 * Intercepts all /api/* requests and applies IP-based, sliding-window
 * rate limiting. Limits are defined per endpoint group, matching the
 * thresholds from Rate limiting.md:
 *
 *  Auth endpoints (login, OTP)    →  10 req / 1 min
 *  Sensitive actions (OTP, pay)   →   5 req / 1 min
 *  Email / standard API           → 100 req / 1 min
 *
 * The counter store is a plain Map held in the Edge isolate's memory.
 * This resets on each new isolate start, which is acceptable for a
 * stateless edge deployment — persistent cross-region state would
 * require an external KV store (e.g. Netlify Blobs or Upstash Redis).
 */

import type { Context } from "https://edge.netlify.com";

// ─── Rate limit config ────────────────────────────────────────────────────────

interface RateRule {
  /** Max requests allowed in the window */
  limit: number;
  /** Sliding window size in milliseconds */
  windowMs: number;
}

/**
 * Map of URL pathname prefix → rate rule.
 * Rules are evaluated top-to-bottom; the first matching prefix wins.
 */
const RATE_RULES: Array<[prefix: string, rule: RateRule]> = [
  // ── Sensitive Actions (OTP + Payments) — 5 / min ──────────────────────────
  ["/api/email/signup-otp",         { limit: 5,   windowMs: 60_000 }],
  ["/api/auth/send-college-otp",    { limit: 5,   windowMs: 60_000 }],
  ["/api/auth/verify-college-otp",  { limit: 5,   windowMs: 60_000 }],
  ["/api/payments/verify",          { limit: 5,   windowMs: 60_000 }],

  // ── Authentication — 10 / min ─────────────────────────────────────────────
  ["/api/auth/is-admin",            { limit: 10,  windowMs: 60_000 }],

  // ── Email / Standard API — 100 / min ─────────────────────────────────────
  ["/api/email/announcement",       { limit: 100, windowMs: 60_000 }],
  ["/api/email/registration",       { limit: 100, windowMs: 60_000 }],
  ["/api/email/task",               { limit: 100, windowMs: 60_000 }],
  ["/api/email/team-invite",        { limit: 100, windowMs: 60_000 }],

  // ── Fallback for any other /api/* route ───────────────────────────────────
  ["/api/",                         { limit: 100, windowMs: 60_000 }],
];

// ─── In-isolate sliding-window store ─────────────────────────────────────────

interface Bucket {
  /** Unix timestamps (ms) of each request in the current window */
  timestamps: number[];
}

// key = "<ip>|<path-prefix>"
const store = new Map<string, Bucket>();

function isRateLimited(ip: string, prefix: string, rule: RateRule): boolean {
  const key = `${ip}|${prefix}`;
  const now = Date.now();
  const windowStart = now - rule.windowMs;

  let bucket = store.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    store.set(key, bucket);
  }

  // Evict timestamps outside the current window (sliding)
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= rule.limit) {
    return true; // rate limited
  }

  bucket.timestamps.push(now);
  return false;
}

// ─── Isolate memory leak guard ────────────────────────────────────────────────
// Prune stale keys every 5 minutes so the Map doesn't grow unbounded
// in long-running isolates.
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60_000;

function maybeCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, bucket] of store.entries()) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length === 0) store.delete(key);
  }
}

// ─── Edge Function handler ────────────────────────────────────────────────────

export default async function rateLimiter(
  request: Request,
  context: Context
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Find the most specific matching rule
  let matched: [string, RateRule] | null = null;
  for (const entry of RATE_RULES) {
    if (path.startsWith(entry[0])) {
      matched = entry;
      break;
    }
  }

  // No rule matched — pass through (shouldn't happen with /api/* binding)
  if (!matched) return context.next();

  const [prefix, rule] = matched;

  // Extract real client IP — Netlify sets x-nf-client-connection-ip
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  maybeCleanup(rule.windowMs);

  if (isRateLimited(ip, prefix, rule)) {
    const retryAfterSec = Math.ceil(rule.windowMs / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Too Many Requests",
        message: `Rate limit exceeded. You may retry after ${retryAfterSec} seconds.`,
        retryAfter: retryAfterSec,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(rule.limit),
          "X-RateLimit-Window": String(retryAfterSec),
        },
      }
    );
  }

  // Not limited — attach informational headers and continue
  const response = await context.next();
  const remaining = Math.max(
    0,
    rule.limit - (store.get(`${ip}|${prefix}`)?.timestamps.length ?? 0)
  );

  const newHeaders = new Headers(response.headers);
  newHeaders.set("X-RateLimit-Limit", String(rule.limit));
  newHeaders.set("X-RateLimit-Remaining", String(remaining));
  newHeaders.set("X-RateLimit-Window", String(Math.ceil(rule.windowMs / 1000)));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
