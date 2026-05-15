// src/config/constants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all magic numbers, TTLs, URLs, and limits.
// Every inline literal that appears in more than one place, or that controls
// observable behaviour (cache TTL, card size, chart dimensions), lives here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Cache ─────────────────────────────────────────────────────────────────────

/** Bump this to instantly invalidate all cached entries across all edge nodes. */
export const CACHE_VERSION = 'v1' as const;

/** Per-endpoint cache TTLs in seconds. */
export const CACHE_TTL = {
  STATS:     14_400, // 4 hours
  LANGUAGES:  7_200, // 2 hours
  STREAK:     7_200, // 2 hours
  ACTIVITY:   7_200, // 2 hours
} as const;

/** Font cache TTL: 30 days (fonts change extremely rarely). */
export const FONT_CACHE_TTL_SECONDS = 2_592_000;

// ── GitHub API ────────────────────────────────────────────────────────────────

export const GITHUB_API_BASE     = 'https://api.github.com' as const;
export const GITHUB_GRAPHQL_URL  = 'https://api.github.com/graphql' as const;
export const GITHUB_API_VERSION  = '2022-11-28' as const;
export const GITHUB_USER_AGENT   = 'github-stats-api/2.0 (Cloudflare-Workers)' as const;

/** Repos fetched per-page for stats & language analysis. */
export const REPOS_PER_PAGE = 100 as const;
/** Max repos analysed for language byte counts. */
export const LANG_REPO_LIMIT = 20 as const;
/** Top N languages to surface. */
export const LANG_TOP_N = 5 as const;
/** Repos fetched for activity analysis. */
export const ACTIVITY_REPOS_PER_PAGE = 20 as const;
/** Max repos scanned for commit timing. */
export const ACTIVITY_REPO_LIMIT = 5 as const;
/** Commits fetched per repo for hour distribution. */
export const ACTIVITY_COMMITS_PER_PAGE = 20 as const;
/** AbortSignal timeout for every upstream GitHub fetch (ms). */
export const GITHUB_FETCH_TIMEOUT_MS = 8_000 as const;

// ── Fonts ─────────────────────────────────────────────────────────────────────

export const FONT_URLS = {
  regular:  'https://unpkg.com/@fontsource/inter@5.0.19/files/inter-latin-400-normal.woff',
  semiBold: 'https://unpkg.com/@fontsource/inter@5.0.19/files/inter-latin-600-normal.woff',
} as const;

// ── Card dimensions ───────────────────────────────────────────────────────────

export const CARD_WIDTH         = 495 as const;
export const CARD_HEIGHT        = 195 as const;
/** Activity card is taller to accommodate both hour and day-of-week charts. */
export const ACTIVITY_CARD_HEIGHT = 260 as const;

// ── Activity chart ────────────────────────────────────────────────────────────

export const CHART_WIDTH    = 420 as const;
export const CHART_HEIGHT   = 70  as const;
export const BAR_COUNT      = 24  as const;
export const BAR_GAP        = 2   as const;
export const BAR_WIDTH      = Math.floor((CHART_WIDTH - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT); // ~16px

export const DAY_CHART_HEIGHT = 40 as const;
export const DAY_BAR_COUNT   = 7  as const;
export const DAY_BAR_GAP     = 6  as const;
export const DAY_BAR_WIDTH   = Math.floor((CHART_WIDTH - DAY_BAR_GAP * (DAY_BAR_COUNT - 1)) / DAY_BAR_COUNT);

// ── Language colours ──────────────────────────────────────────────────────────
// Centralised here so any future service or card can use the same palette.

export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript:  '#f1e05a',
  TypeScript:  '#3178c6',
  Python:      '#3572A5',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Vue:         '#41b883',
  Java:        '#b07219',
  Go:          '#00ADD8',
  'C#':        '#178600',
  PHP:         '#4F5D95',
  Ruby:        '#701516',
  Swift:       '#F05138',
  Rust:        '#dea584',
  Kotlin:      '#A97BFF',
  C:           '#555555',
  'C++':       '#f34b7d',
  Dart:        '#00B4AB',
  Shell:       '#89e051',
};

/** Fallback colour for any language not in LANGUAGE_COLORS. */
export const LANG_COLOR_FALLBACK = '#858585' as const;
