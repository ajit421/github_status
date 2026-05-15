// src/templates/renderCard.ts
import satori from 'satori';
import { FONT_URLS, FONT_CACHE_TTL_SECONDS } from '../config/constants';

// ── Module-level font cache ───────────────────────────────────────────────────
// ArrayBuffers stored here survive for the full lifetime of a single Worker
// isolate (which can handle thousands of requests). Most requests after the
// first will hit this in-memory cache and skip all network I/O.
// Resetting the isolate naturally clears this cache, which is correct behaviour.
let regularFontData: ArrayBuffer | null = null;
let semiBoldFontData: ArrayBuffer | null = null;

/**
 * Fetches a font file using a two-layer cache strategy:
 *
 * Layer 1: Cloudflare Cache API (edge-level, cross-instance).
 *   - If another Worker instance already fetched this font, it's in the edge
 *     cache and we avoid a CDN round-trip entirely.
 *
 * Layer 2: CDN fetch (last resort).
 *   - Fetches from unpkg.com and stores the result in the Cache API for
 *     future instances.
 */
async function fetchFont(url: string, cacheKey: string): Promise<ArrayBuffer> {
  const cache = caches.default;
  // Use a synthetic URL as the Cache API lookup key
  const cacheUrl = `https://font-cache.internal/inter/${cacheKey}`;

  // Try Cloudflare Cache API first
  try {
    const cachedResponse = await cache.match(cacheUrl);
    if (cachedResponse) {
      return cachedResponse.arrayBuffer();
    }
  } catch {
    // Cache miss or error — fall through to CDN fetch
  }

  // Fetch from CDN
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Font fetch failed: ${url} — ${response.status} ${response.statusText}`
    );
  }

  // Read the body ONCE into an ArrayBuffer
  const buffer = await response.arrayBuffer();

  // Write a COPY to Cache API (best-effort)
  // buffer.slice(0) creates a copy so we can pass it to both cache and caller.
  // This is necessary because some JS runtimes detach the original ArrayBuffer
  // when it is passed to the Response constructor, making it unusable later.
  try {
    await cache.put(
      cacheUrl,
      new Response(buffer.slice(0), {
        headers: {
          'Content-Type': 'font/woff',
          'Cache-Control': `public, max-age=${FONT_CACHE_TTL_SECONDS}`,
        },
      })
    );
  } catch { /* best-effort — never throws */ }

  return buffer;
}

/**
 * Loads Inter Regular (400) and SemiBold (600).
 * Populates the module-level cache on first call.
 */
async function loadFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  // Fastest path: fonts already in module-level memory
  if (regularFontData && semiBoldFontData) {
    return [regularFontData, semiBoldFontData];
  }

  // Fetch both fonts concurrently
  const [regular, semiBold] = await Promise.all([
    fetchFont(FONT_URLS.regular, 'inter-latin-400-normal'),
    fetchFont(FONT_URLS.semiBold, 'inter-latin-600-normal'),
  ]);

  // Store in module-level cache for this Worker instance's lifetime
  regularFontData = regular;
  semiBoldFontData = semiBold;

  return [regular, semiBold];
}

/**
 * Clears the module-level font cache.
 * Useful for test resets or forcing a re-fetch without restarting the isolate.
 */
export function clearFontCache(): void {
  regularFontData = null;
  semiBoldFontData = null;
}

/**
 * Renders a Hono JSX element to an SVG string via Satori.
 *
 * The `element` parameter is typed as `any` for two reasons:
 * 1. Satori's TypeScript definition uses `React.ReactNode`, which we don't import.
 * 2. At runtime, Hono JSX elements have the exact same virtual DOM shape
 *    ({ type, props, key }) that Satori expects, so there is no runtime error.
 *
 * `skipLibCheck: true` in tsconfig.json prevents Satori's .d.ts from
 * causing a TS compilation error about the missing React types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderCard(element: any, width = 495, height = 195): Promise<string> {
  return renderCardWithSize(element, { width, height });
}

/**
 * Convenience overload that accepts an options object for custom sizes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderCardWithSize(
  element: any,
  options: { width?: number; height?: number } = {}
): Promise<string> {
  const [regular, semiBold] = await loadFonts();

  return satori(element, {
    width: options.width ?? 495,
    height: options.height ?? 195,
    fonts: [
      { name: 'Inter', data: regular,  weight: 400, style: 'normal' },
      { name: 'Inter', data: semiBold, weight: 600, style: 'normal' },
    ],
  });
}
