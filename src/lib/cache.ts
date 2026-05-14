// src/lib/cache.ts

// ── TTL constants (seconds) ───────────────────────────────────────────────────
export const CACHE_TTL = {
  STATS:     14400, // 4 hours
  LANGUAGES:  7200, // 2 hours
  STREAK:     7200, // 2 hours
  ACTIVITY:   7200, // 2 hours
} as const;

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
 * Cache-aside wrapper using the Cloudflare Cache API.
 *
 * ── How it works ─────────────────────────────────────────────────────────────
 * The Cache API works with Request/Response pairs, keyed by URL.
 * We create a synthetic HTTPS URL from the cache key string to use as the key.
 * TTL is enforced by setting `Cache-Control: max-age=N` on the stored Response —
 * Cloudflare honours this and automatically evicts entries when they expire.
 *
 * ── Graceful degradation ─────────────────────────────────────────────────────
 * Cache read/write errors are caught and logged. They NEVER throw or crash the
 * request handler. If the cache is unavailable, the fetcher is called directly.
 *
 * ── Local dev ────────────────────────────────────────────────────────────────
 * `wrangler dev` simulates the Cache API in memory. It works the same as
 * production but does not persist across dev server restarts.
 */
export async function withCache(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<string>
): Promise<string> {
  const cache = caches.default;

  // Synthetic URL: must be a valid HTTPS URL. The hostname is fictional but valid.
  // encodeURIComponent handles colons, braces, quotes, spaces in the key string.
  const cacheUrl = `https://github-stats-cache.internal/v1/${encodeURIComponent(key)}`;

  // ── 1. Attempt cache read ─────────────────────────────────────────────────
  try {
    const cachedResponse = await cache.match(cacheUrl);
    if (cachedResponse) {
      return cachedResponse.text();
    }
  } catch (err) {
    console.warn(`[cache] Read failed for key "${key}":`, err);
  }

  // ── 2. Cache miss — call the real data source ─────────────────────────────
  const result = await fetcher();

  // ── 3. Write to cache (best-effort) ──────────────────────────────────────
  try {
    await cache.put(
      cacheUrl,
      new Response(result, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': `public, max-age=${ttlSeconds}`,
        },
      })
    );
  } catch (err) {
    console.warn(`[cache] Write failed for key "${key}":`, err);
  }

  return result;
}
