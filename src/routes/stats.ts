// src/routes/stats.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { getStats } from '../services/statsService';
import { withCache, buildCacheKey, CACHE_TTL } from '../lib/cache';
import { StatsCard } from '../templates/StatsCard';
import { ErrorCard } from '../templates/ErrorCard';
import { renderCard } from '../templates/renderCard';
import { THEMES, type ThemeName } from '../lib/themes';

const route = new Hono<{ Bindings: Env }>();

const TTL = CACHE_TTL.STATS;

const HEADERS_OK: Record<string, string> = {
  'Content-Type':  'image/svg+xml',
  'Cache-Control': `public, max-age=${TTL}, s-maxage=${TTL}`,
};
const HEADERS_ERR: Record<string, string> = {
  'Content-Type':  'image/svg+xml',
  'Cache-Control': 'no-store',
};

function resolveTheme(raw?: string): ThemeName {
  return raw && raw in THEMES ? (raw as ThemeName) : 'default';
}

route.get('/', async (c) => {
  const token    = c.env.GITHUB_TOKEN;
  const username = c.req.query('username');
  const theme    = resolveTheme(c.req.query('theme'));

  if (!username) {
    const svg = await renderCard(ErrorCard({ message: 'Missing required parameter: username', theme }));
    return new Response(svg, { status: 400, headers: HEADERS_ERR });
  }

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

  try {
    const key  = buildCacheKey('stats', params);
    const data = await withCache(key, TTL, async () => {
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

    return new Response(svg, { headers: HEADERS_OK });
  } catch (err) {
    console.error(`[stats] Error for ${username}:`, err);
    const message = err instanceof Error ? err.message : 'Failed to fetch GitHub stats';
    const svg = await renderCard(ErrorCard({ message, theme }));
    return new Response(svg, { status: 500, headers: HEADERS_ERR });
  }
});

export default route;
