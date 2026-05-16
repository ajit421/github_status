// src/routes/activity.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { fetchCommitActivity } from '../services/activityService';
import { withCache, buildCacheKey } from '../lib/cache';
import { CACHE_TTL, ACTIVITY_CARD_HEIGHT } from '../config/constants';
import { ActivityCard } from '../templates/cards/ActivityCard';
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

    const params: Record<string, string | undefined> = {
      username,
      theme:       c.req.query('theme'),
      hide_border: c.req.query('hide_border'),
    };

    const key = buildCacheKey('activity', params);
    const { data, cacheStatus } = await withCache(key, { ttlSeconds: TTL }, async () => {
      const activity = await fetchCommitActivity(username, token);
      return JSON.stringify(activity);
    });

    // Activity card is taller than standard (includes byDay chart)
    const svg = await renderCardWithSize(
      ActivityCard({
        activity:   JSON.parse(data),
        theme,
        hideBorder: params.hide_border === 'true',
      }),
      { height: ACTIVITY_CARD_HEIGHT }
    );

    return new Response(svg, {
      headers: { ...buildSvgHeaders(TTL), 'X-Cache-Status': cacheStatus },
    });
  } catch (err) {
    console.error('[activity] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch activity data';
    // Error card uses standard height
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
