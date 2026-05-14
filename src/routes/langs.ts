// src/routes/langs.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { getTopLanguages } from '../services/languageService';
import { withCache, buildCacheKey, CACHE_TTL } from '../lib/cache';
import { LanguageCard } from '../templates/LanguageCard';
import { ErrorCard } from '../templates/ErrorCard';
import { renderCard } from '../templates/renderCard';
import { THEMES, type ThemeName } from '../lib/themes';

const route = new Hono<{ Bindings: Env }>();

const TTL = CACHE_TTL.LANGUAGES;

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

function resolveLayout(raw?: string): 'normal' | 'compact' | 'pie' {
  return raw === 'compact' || raw === 'pie' ? raw : 'normal';
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
    theme:       c.req.query('theme'),
    layout:      c.req.query('layout'),
    hide_border: c.req.query('hide_border'),
  };

  try {
    const key  = buildCacheKey('langs', params);
    const data = await withCache(key, TTL, async () => {
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

    return new Response(svg, { headers: HEADERS_OK });
  } catch (err) {
    console.error(`[langs] Error for ${username}:`, err);
    const message = err instanceof Error ? err.message : 'Failed to fetch language data';
    const svg = await renderCard(ErrorCard({ message, theme }));
    return new Response(svg, { status: 500, headers: HEADERS_ERR });
  }
});

export default route;
