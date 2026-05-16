// src/routes/activity-graph.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { fetchActivityGraphData } from '../services/activityGraphService';
import { withCache, buildCacheKey } from '../lib/cache';
import { CACHE_TTL } from '../config/constants';
import { ActivityGraphCard } from '../templates/cards/ActivityGraphCard';
import { ErrorCard } from '../templates/cards/ErrorCard';
import { renderCard } from '../templates/renderCard';
import {
  resolveTheme,
  buildSvgHeaders,
  getErrorStatus,
} from '../utils/params';
import { UserNotFoundError, RateLimitError } from '../lib/errors';

const route = new Hono<{ Bindings: Env }>();
const TTL = CACHE_TTL.STREAK; // Use streak TTL (2h)

route.get('/', async (c) => {
  const theme = resolveTheme(c.req.query('theme'));

  try {
    const username = c.req.query('username');
    if (!username) throw new UserNotFoundError('Missing required parameter: username');

    const token = c.req.query('token') || c.env.GITHUB_TOKEN;

    const params: Record<string, string | undefined> = {
      username,
      theme:        c.req.query('theme'),
      hide_border:  c.req.query('hide_border'),
      hide_title:   c.req.query('hide_title'),
      custom_title: c.req.query('custom_title'),
      bg_color:     c.req.query('bg_color'),
      text_color:   c.req.query('text_color'),
      title_color:  c.req.query('title_color'),
      line_color:   c.req.query('line_color'),
      point_color:  c.req.query('point_color'),
      area_color:   c.req.query('area_color'),
    };

    const key = buildCacheKey('activity-graph', params);
    const { data, cacheStatus } = await withCache(key, { ttlSeconds: TTL }, async () => {
      const graphData = await fetchActivityGraphData(username, token);
      return JSON.stringify(graphData);
    });

    const svg = await renderCard(
      ActivityGraphCard({
        data:         JSON.parse(data),
        username,
        theme,
        hideBorder:  params.hide_border  === 'true',
        hideTitle:   params.hide_title   === 'true',
        customTitle: params.custom_title,
        bgColor:     params.bg_color,
        textColor:   params.text_color,
        titleColor:  params.title_color,
        lineColor:   params.line_color,
        pointColor:  params.point_color,
        areaColor:   params.area_color,
      })
    );

    return new Response(svg, {
      headers: { ...buildSvgHeaders(TTL), 'X-Cache-Status': cacheStatus },
    });
  } catch (err) {
    console.error('[activity-graph] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch activity graph';
    const svg = await renderCard(ErrorCard({ message, theme }));
    const status = getErrorStatus(err);
    return new Response(svg, {
      status,
      headers: { ...buildSvgHeaders(0, true), 'X-Cache-Status': 'MISS' },
    });
  }
});

export default route;
