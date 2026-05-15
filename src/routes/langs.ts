// src/routes/langs.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { getTopLanguages } from '../services/languageService';
import { withCache, buildCacheKey } from '../lib/cache';
import { CACHE_TTL } from '../config/constants';
import { LanguageCard } from '../templates/cards/LanguageCard';
import { ErrorCard } from '../templates/cards/ErrorCard';
import { renderCard } from '../templates/renderCard';
import {
  resolveTheme,
  resolveLayout,
  buildSvgHeaders,
  getErrorStatus,
} from '../utils/params';
import { UserNotFoundError, RateLimitError } from '../lib/errors';

const route = new Hono<{ Bindings: Env }>();
const TTL = CACHE_TTL.LANGUAGES;

route.get('/', async (c) => {
  const theme = resolveTheme(c.req.query('theme'));

  try {
    const username = c.req.query('username');
    if (!username) throw new UserNotFoundError('Missing required parameter: username');

    const token = c.env.GITHUB_TOKEN;

    const params: Record<string, string | undefined> = {
      username,
      theme:       c.req.query('theme'),
      layout:      c.req.query('layout'),
      hide_border: c.req.query('hide_border'),
    };

    const key = buildCacheKey('langs', params);
    const { data, cacheStatus } = await withCache(key, { ttlSeconds: TTL }, async () => {
      const langs = await getTopLanguages(username, token);
      return JSON.stringify(langs);
    });

    const svg = await renderCard(
      LanguageCard({
        languages:  JSON.parse(data),
        theme,
        layout:     resolveLayout(params.layout),
        hideBorder: params.hide_border === 'true',
      })
    );

    return new Response(svg, {
      headers: { ...buildSvgHeaders(TTL), 'X-Cache-Status': cacheStatus },
    });
  } catch (err) {
    console.error('[langs] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch language data';
    const svg = await renderCard(ErrorCard({ message, theme }));
    const status = getErrorStatus(err);
    const headers: Record<string, string> = { ...buildSvgHeaders(0, true), 'X-Cache-Status': 'MISS' };
    if (err instanceof RateLimitError && err.resetTimestamp) {
      headers['Retry-After'] = String(err.resetTimestamp);
    }
    return new Response(svg, { status, headers });
  }
});

export default route;
