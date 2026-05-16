// src/routes/profile.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { fetchProfileData } from '../services/profileService';
import { withCache, buildCacheKey } from '../lib/cache';
import { CACHE_TTL } from '../config/constants';
import { ProfileCard } from '../templates/cards/ProfileCard';
import { ErrorCard } from '../templates/cards/ErrorCard';
import { renderCard, renderCardWithSize } from '../templates/renderCard';
import { resolveTheme, buildSvgHeaders, getErrorStatus } from '../utils/params';
import { UserNotFoundError, RateLimitError } from '../lib/errors';

const route = new Hono<{ Bindings: Env }>();
const TTL = CACHE_TTL.STATS;

route.get('/', async (c) => {
  const theme = resolveTheme(c.req.query('theme'));

  try {
    const username = c.req.query('username');
    if (!username) throw new UserNotFoundError('Missing required parameter: username');

    const token = c.req.query('token') || c.env.GITHUB_TOKEN;

    const params: Record<string, string | undefined> = {
      username,
      theme: c.req.query('theme'),
      hide_border: c.req.query('hide_border'),
      show_avatar: c.req.query('show_avatar'),
      show_bio: c.req.query('show_bio'),
      show_languages: c.req.query('show_languages'),
      show_stats: c.req.query('show_stats'),
      card_width: c.req.query('card_width'),
      card_height: c.req.query('card_height'),
    };

    const key = buildCacheKey('profile', params);
    const { data, cacheStatus } = await withCache(key, { ttlSeconds: TTL }, async () => {
      const profile = await fetchProfileData(username, token);
      return JSON.stringify(profile);
    });

    const cardWidth = params.card_width ? parseInt(params.card_width, 10) : 495;
    const cardHeight = params.card_height ? parseInt(params.card_height, 10) : 220;

    const svg = await renderCardWithSize(
      ProfileCard({
        profile: JSON.parse(data),
        theme,
        hideBorder: params.hide_border === 'true',
        showAvatar: params.show_avatar !== 'false',
        showBio: params.show_bio !== 'false',
        showLanguages: params.show_languages !== 'false',
        showStats: params.show_stats !== 'false',
        cardWidth,
        cardHeight,
      }),
      { width: cardWidth, height: cardHeight }
    );

    return new Response(svg, {
      headers: { ...buildSvgHeaders(TTL), 'X-Cache-Status': cacheStatus },
    });
  } catch (err) {
    console.error('[profile] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch profile data';
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
