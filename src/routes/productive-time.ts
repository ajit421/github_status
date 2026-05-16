// src/routes/productive-time.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { fetchProductiveTime } from '../services/productiveTimeService';
import { withCache, buildCacheKey } from '../lib/cache';
import { CACHE_TTL } from '../config/constants';
import { ProductiveTimeCard } from '../templates/cards/ProductiveTimeCard';
import { ErrorCard } from '../templates/cards/ErrorCard';
import { renderCard, renderCardWithSize } from '../templates/renderCard';
import { resolveTheme, buildSvgHeaders, getErrorStatus } from '../utils/params';
import { UserNotFoundError, RateLimitError } from '../lib/errors';

const route = new Hono<{ Bindings: Env }>();
const TTL = CACHE_TTL.ACTIVITY;

route.get('/', async (c) => {
  const theme = resolveTheme(c.req.query('theme'));

  try {
    const username = c.req.query('username');
    if (!username) throw new UserNotFoundError('Missing required parameter: username');

    const token = c.req.query('token') || c.env.GITHUB_TOKEN;
    const parsedOffset = parseFloat(c.req.query('utc_offset') ?? '0');
    const utcOffset = isNaN(parsedOffset) ? 0 : parsedOffset;

    const params: Record<string, string | undefined> = {
      username,
      theme: c.req.query('theme'),
      hide_border: c.req.query('hide_border'),
      utc_offset: c.req.query('utc_offset'),
      card_width: c.req.query('card_width'),
      card_height: c.req.query('card_height'),
    };

    const key = buildCacheKey('productive-time', params);
    const { data, cacheStatus } = await withCache(key, { ttlSeconds: TTL }, async () => {
      const ptData = await fetchProductiveTime(username, utcOffset, token);
      return JSON.stringify(ptData);
    });

    const cardWidth = params.card_width ? parseInt(params.card_width, 10) : 495;
    const cardHeight = params.card_height ? parseInt(params.card_height, 10) : 195;

    const svg = await renderCardWithSize(
      ProductiveTimeCard({
        data: JSON.parse(data),
        theme,
        hideBorder: params.hide_border === 'true',
        cardWidth,
        cardHeight,
      }),
      { width: cardWidth, height: cardHeight }
    );

    return new Response(svg, {
      headers: { ...buildSvgHeaders(TTL), 'X-Cache-Status': cacheStatus },
    });
  } catch (err) {
    console.error('[productive-time] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch productive time data';
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
