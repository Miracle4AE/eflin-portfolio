/**
 * Simple in-memory rate limiter — suitable for local dev and single-process servers.
 *
 * PRODUCTION NOTE: Vercel serverless functions are stateless; this store does not
 * persist across instances. For production, replace with a shared store:
 *
 *   - Vercel KV: https://vercel.com/docs/storage/vercel-kv
 *   - Upstash Redis: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * Example (Upstash):
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis } from "@upstash/redis";
 *   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "1 h") });
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const MAX_STORE_SIZE = 10_000;

function pruneExpired(now: number) {
  if (store.size < MAX_STORE_SIZE) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec?: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Best-effort client IP for rate limiting behind proxies (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
