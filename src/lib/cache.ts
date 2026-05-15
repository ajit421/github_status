// src/lib/cache.ts
import { CACHE_VERSION } from '../config/constants';

// ── Public TTL constants re-exported for convenience ─────────────────────────
// Routes import CACHE_TTL from config/constants directly; this re-export
// maintains backward-compatible convenience for any future callers.
export { CACHE_TTL } from '../config/constants';

export interface CacheOptions {
  /** How long (seconds) CDN and browser should cache the response. */
  ttlSeconds: number;
  /**
   * Extra seconds a stale entry may be served while revalidation happens
   * in the background. Appended as `stale-while-revalidate=M`.
   * Defaults to 0 (disabled).
   */
  staleWhileRevalidate?: number;
  /**
   * Logical namespace for the cache key URL. Defaults to CACHE_VERSION.
   * Override to isolate entries across feature flags or experiments.
   */
  cacheNamespace?: string;
}

/**
 * Builds a deterministic, URL-safe cache key string.
 * Keys are sorted alphabetically so param order never creates duplicate entries.
 *
 * Example:
 *   buildCacheKey("stats", { username: "octocat", theme: "dark" })
 *   → 'stats:{"theme":"dark","username":"octocat"}'
 */
export function buildCacheKey(
  prefix: string,
  params: Record<string, string | undefined>
): string {
  const stable = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
  );
  return `${prefix}:${JSON.stringify(stable)}`;
}

/**
 * Purges a single entry from the Cloudflare Cache API by key string.
 * Returns true if an entry was found and deleted, false otherwise.
 * Intended for admin/debug use only.
 */
export async function purgeCache(key: string, cacheNamespace = CACHE_VERSION): Promise<boolean> {
  const cache = caches.default;
  const cacheUrl = `https://github-stats-cache.internal/${cacheNamespace}/${encodeURIComponent(key)}`;
  return cache.delete(cacheUrl);
}

/**
 * Cache-aside wrapper using the Cloudflare Cache API.
 * Returns the data string AND a cache status indicator for response headers.
 *
 * ── How it works ──────────────────────────────────────────────────────────────
 * Cache keys are versioned URLs. Bumping CACHE_VERSION in constants.ts
 * instantly invalidates all cached entries by changing the URL namespace.
 *
 * ── Graceful degradation ──────────────────────────────────────────────────────
 * Cache read/write errors are caught and logged. They NEVER throw or crash the
 * request handler. If the cache is unavailable, the fetcher is called directly.
 *
 * ── Structured logging ────────────────────────────────────────────────────────
 * Events (cache_hit, cache_miss, cache_write) are emitted as JSON to stdout
 * for Cloudflare Workers Logpush / `wrangler tail` consumption.
 */
export async function withCache(
  key: string,
  options: CacheOptions,
  fetcher: () => Promise<string>
): Promise<{ data: string; cacheStatus: 'HIT' | 'MISS' }> {
  const cache = caches.default;
  const ns = options.cacheNamespace ?? CACHE_VERSION;

  // Versioned synthetic URL — changing CACHE_VERSION busts all entries
  const cacheUrl = `https://github-stats-cache.internal/${ns}/${encodeURIComponent(key)}`;

  // ── 1. Attempt cache read ──────────────────────────────────────────────────
  const t0 = performance.now();
  try {
    const cachedResponse = await cache.match(cacheUrl);
    if (cachedResponse) {
      const durationMs = Math.round(performance.now() - t0);
      console.log(JSON.stringify({ event: 'cache_hit', key, durationMs }));
      return { data: await cachedResponse.text(), cacheStatus: 'HIT' };
    }
  } catch (err) {
    console.warn(`[cache] Read failed for key "${key}":`, err);
  }

  // ── 2. Cache miss — call the real data source ──────────────────────────────
  const t1 = performance.now();
  const result = await fetcher();
  const fetchMs = Math.round(performance.now() - t1);
  console.log(JSON.stringify({ event: 'cache_miss', key, fetchMs }));

  // ── 3. Write to cache (best-effort) ───────────────────────────────────────
  try {
    const swr = options.staleWhileRevalidate ?? 0;
    const cacheControl = swr > 0
      ? `public, max-age=${options.ttlSeconds}, stale-while-revalidate=${swr}`
      : `public, max-age=${options.ttlSeconds}`;

    const t2 = performance.now();
    await cache.put(
      cacheUrl,
      new Response(result, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': cacheControl,
        },
      })
    );
    const writeMs = Math.round(performance.now() - t2);
    console.log(JSON.stringify({ event: 'cache_write', key, writeMs }));
  } catch (err) {
    console.warn(`[cache] Write failed for key "${key}":`, err);
  }

  return { data: result, cacheStatus: 'MISS' };
}
