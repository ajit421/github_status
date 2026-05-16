// src/routes/repo.ts
import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { fetchRepoData, fetchUserRepos } from '../services/repoService';
import { withCache, buildCacheKey } from '../lib/cache';
import { CACHE_TTL } from '../config/constants';
import { RepoCard } from '../templates/cards/RepoCard';
import { ErrorCard } from '../templates/cards/ErrorCard';
import { renderCard, renderCardWithSize } from '../templates/renderCard';
import { resolveTheme, buildSvgHeaders, getErrorStatus } from '../utils/params';
import { UserNotFoundError, RateLimitError } from '../lib/errors';

const route = new Hono<{ Bindings: Env }>();
const TTL = CACHE_TTL.LANGUAGES;

// GET /api/repo?username=x&repo=y — fetch single repo card
route.get('/', async (c) => {
  const theme = resolveTheme(c.req.query('theme'));

  try {
    const username = c.req.query('username');
    if (!username) throw new UserNotFoundError('Missing required parameter: username');

    const repoName = c.req.query('repo');
    if (!repoName) throw new UserNotFoundError('Missing required parameter: repo');

    const token = c.req.query('token') || c.env.GITHUB_TOKEN;

    const params: Record<string, string | undefined> = {
      username,
      repo: repoName,
      theme: c.req.query('theme'),
      hide_border: c.req.query('hide_border'),
      show_description: c.req.query('show_description'),
      show_language: c.req.query('show_language'),
      show_stars: c.req.query('show_stars'),
      show_forks: c.req.query('show_forks'),
      show_issues: c.req.query('show_issues'),
      show_topics: c.req.query('show_topics'),
      show_license: c.req.query('show_license'),
      card_width: c.req.query('card_width'),
      card_height: c.req.query('card_height'),
    };

    const key = buildCacheKey('repo', params);
    const { data, cacheStatus } = await withCache(key, { ttlSeconds: TTL }, async () => {
      const repo = await fetchRepoData(username, repoName, token);
      return JSON.stringify(repo);
    });

    const cardWidth = params.card_width ? parseInt(params.card_width, 10) : 495;
    const cardHeight = params.card_height ? parseInt(params.card_height, 10) : 195;

    const svg = await renderCardWithSize(
      RepoCard({
        repo: JSON.parse(data),
        theme,
        hideBorder: params.hide_border === 'true',
        showDescription: params.show_description !== 'false',
        showLanguage: params.show_language !== 'false',
        showStars: params.show_stars !== 'false',
        showForks: params.show_forks !== 'false',
        showIssues: params.show_issues !== 'false',
        showTopics: params.show_topics !== 'false',
        showLicense: params.show_license !== 'false',
        cardWidth,
        cardHeight,
      }),
      { width: cardWidth, height: cardHeight }
    );

    return new Response(svg, {
      headers: { ...buildSvgHeaders(TTL), 'X-Cache-Status': cacheStatus },
    });
  } catch (err) {
    console.error('[repo] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch repo data';
    const svg = await renderCard(ErrorCard({ message, theme }));
    const status = getErrorStatus(err);
    const headers: Record<string, string> = { ...buildSvgHeaders(0, true), 'X-Cache-Status': 'MISS' };
    if (err instanceof RateLimitError && err.resetTimestamp) {
      headers['Retry-After'] = String(err.resetTimestamp);
    }
    return new Response(svg, { status, headers });
  }
});

// GET /api/repo/list?username=x — return list of repos as JSON (for builder UI)
route.get('/list', async (c) => {
  try {
    const username = c.req.query('username');
    if (!username) {
      return c.json({ error: 'Missing username' }, 400);
    }
    const token = c.req.query('token') || c.env.GITHUB_TOKEN;
    const repos = await fetchUserRepos(username, token);
    return c.json({ repos });
  } catch (err) {
    return c.json({ error: 'Failed to fetch repos', repos: [] }, 500);
  }
});

export default route;
