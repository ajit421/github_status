// src/lib/cache.ts
import { Redis } from "@upstash/redis";

// ── Client initialisation ─────────────────────────────────────────────────────
// Initialised lazily so a missing environment variable does not crash the app
// at startup. If missing, caching is bypassed gracefully.

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient !== null) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[cache] Upstash Redis credentials missing! Caching disabled.");
    // Return null and let caller handle cache miss natively
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

// ── TTL constants ─────────────────────────────────────────────────────────────

export const CACHE_TTL = {
  STATS: 14400,     // 4 hours
  LANGUAGES: 7200,  // 2 hours
  STREAK: 7200,     // 2 hours
  ACTIVITY: 7200,   // 2 hours
} as const;

// ── Cache key builder ─────────────────────────────────────────────────────────

/**
 * Builds a deterministic cache key that includes all query params affecting
 * the output, so different query combinations never collide.
 *
 * Example: buildCacheKey("stats", { username: "octocat", theme: "dark" })
 *          → 'stats:{"theme":"dark","username":"octocat"}'
 */
export function buildCacheKey(
  prefix: string,
  params: Record<string, string | undefined>
): string {
  // Sort keys so param order never creates duplicate cache entries.
  const stable = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
  );
  return `${prefix}:${JSON.stringify(stable)}`;
}

// ── Generic cache wrapper ─────────────────────────────────────────────────────

/**
 * Cache-aside wrapper.
 *
 * 1. Try Redis GET. On hit, parse JSON and return typed T.
 * 2. On miss, call fetcher(), write result to Redis with EX ttlSeconds, return it.
 * 3. If Redis throws at ANY point, log a warning and fall through to fetcher().
 *    Redis errors must NEVER crash the API.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // ── Attempt cache read ───────────────────────────────────────────────────────
  let cached: string | null = null;
  const redis = getRedis();

  if (redis) {
    try {
      cached = await redis.get<string>(key);
    } catch (err) {
      console.warn(`[cache] Redis GET failed for key "${key}":`, err);
    }
  }

  if (cached !== null) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // Corrupt/unexpected cache value — treat as a miss.
      console.warn(`[cache] Failed to parse cached value for key "${key}"`);
    }
  }

  // ── Cache miss — call the real data source ───────────────────────────────────
  const result = await fetcher();

  // ── Attempt cache write (best-effort, never throws) ──────────────────────────
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(result), { ex: ttlSeconds });
    } catch (err) {
      console.warn(`[cache] Redis SET failed for key "${key}":`, err);
    }
  }

  return result;
}
