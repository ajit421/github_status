// src/routes/streak.ts
import { Hono } from "hono";
import { fetchContributionData } from '../services/contributionService';
import { withCache, buildCacheKey, CACHE_TTL } from '../lib/cache';
import { StreakCard } from '../templates/StreakCard';
import { ErrorCard } from '../templates/ErrorCard';
import { renderCard } from '../templates/renderCard';
import { THEMES, type ThemeName } from '../lib/themes';

const route = new Hono();

const TTL = CACHE_TTL.STREAK; // 7200 s

const SVG_OK: Record<string, string> = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": `public, max-age=${TTL}, s-maxage=${TTL}`,
};

const SVG_ERROR: Record<string, string> = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "no-store",
};

function resolveTheme(raw?: string): ThemeName {
  if (raw && raw in THEMES) return raw as ThemeName;
  return "default";
}

async function errorSvg(message: string, theme: ThemeName): Promise<string> {
  return renderCard(ErrorCard({ message, theme }));
}

route.get("/", async (c) => {
  const username = c.req.query("username");
  const theme = resolveTheme(c.req.query("theme"));

  if (!username) {
    const svg = await errorSvg("Missing required parameter: username", theme);
    return new Response(svg, { status: 400, headers: SVG_ERROR });
  }

  const params: Record<string, string | undefined> = {
    username,
    theme: c.req.query("theme"),
    hide_border: c.req.query("hide_border"),
  };

  try {
    const key = buildCacheKey("streak", params);
    const data = await withCache(key, TTL, () =>
      fetchContributionData(username)
    );

    const svg = await renderCard(
      StreakCard({
        streakData: data,
        theme,
        hideBorder: params.hide_border === "true",
      })
    );

    return new Response(svg, { headers: SVG_OK });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch streak data";
    const svg = await errorSvg(message, theme);
    return new Response(svg, { status: 500, headers: SVG_ERROR });
  }
});

export default route;
