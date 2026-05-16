// src/routes/stats.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { getStats } from '../services/statsService';
import { withCache, buildCacheKey } from '../lib/cache';
import { CACHE_TTL } from '../config/constants';
import { StatsCard } from '../templates/cards/StatsCard';
import { ErrorCard } from '../templates/cards/ErrorCard';
import { renderCard } from '../templates/renderCard';
import {
  resolveTheme,
  buildSvgHeaders,
  getErrorStatus,
} from '../utils/params';
import { UserNotFoundError, RateLimitError } from '../lib/errors';

const route = new Hono<{ Bindings: Env }>();
const TTL = CACHE_TTL.STATS;

route.get('/', async (c) => {
  // Resolve theme early so it is available inside the catch block for the
  // error card even if username validation throws.
  const theme = resolveTheme(c.req.query('theme'));

  try {
    const username = c.req.query('username');
    if (!username) throw new UserNotFoundError('Missing required parameter: username');

    const token = c.req.query('token') || c.env.GITHUB_TOKEN;

    const params: Record<string, string | undefined> = {
      username,
      theme:        c.req.query('theme'),
      hide_border:  c.req.query('hide_border'),
      hide_rank:    c.req.query('hide_rank'),
      show_icons:   c.req.query('show_icons'),
      custom_title: c.req.query('custom_title'),
      bg_color:     c.req.query('bg_color'),
      text_color:   c.req.query('text_color'),
      title_color:  c.req.query('title_color'),
      icon_color:   c.req.query('icon_color'),
      border_color: c.req.query('border_color'),
    };

    const key = buildCacheKey('stats', params);
    const { data, cacheStatus } = await withCache(key, { ttlSeconds: TTL }, async () => {
      const stats = await getStats(username, token);
      return JSON.stringify(stats);
    });

    const svg = await renderCard(
      StatsCard({
        stats:       JSON.parse(data),
        theme,
        hideBorder:  params.hide_border  === 'true',
        hideRank:    params.hide_rank    === 'true',
        showIcons:   params.show_icons   !== 'false',
        customTitle: params.custom_title,
        bgColor:     params.bg_color,
        textColor:   params.text_color,
        titleColor:  params.title_color,
        iconColor:   params.icon_color,
        borderColor: params.border_color,
      })
    );

    return new Response(svg, {
      headers: { ...buildSvgHeaders(TTL), 'X-Cache-Status': cacheStatus },
    });
  } catch (err) {
    console.error('[stats] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch GitHub stats';
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
