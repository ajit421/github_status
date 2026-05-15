// src/utils/params.ts
import type { Context } from 'hono';
import { THEMES, type ThemeName } from '../lib/themes';
import { UserNotFoundError, RateLimitError, TokenRequiredError } from '../lib/errors';

export interface CommonParams {
  username: string;
  theme: ThemeName;
  hideBorder: boolean;
  [key: string]: string | boolean | undefined;
}

export function resolveTheme(raw?: string | null): ThemeName {
  return raw && raw in THEMES ? (raw as ThemeName) : 'default';
}

export function resolveLayout(raw?: string | null): 'normal' | 'compact' | 'pie' {
  return raw === 'compact' || raw === 'pie' ? raw : 'normal';
}

/**
 * Parses query parameters common to all cards.
 * Throws a UserNotFoundError if username is missing.
 */
export function parseCommonParams(c: Context): CommonParams {
  const username = c.req.query('username');
  if (!username) {
    throw new UserNotFoundError('Missing required parameter: username');
  }

  return {
    username,
    theme: resolveTheme(c.req.query('theme')),
    hideBorder: c.req.query('hide_border') === 'true',
  };
}

/**
 * Builds HTTP headers for SVG card responses.
 * @param ttlSeconds How long the CDN should cache a success response.
 * @param isError If true, disables caching completely.
 */
export function buildSvgHeaders(ttlSeconds: number, isError = false): Record<string, string> {
  if (isError) {
    return {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store',
    };
  }
  return {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`,
  };
}

/**
 * Helper to map typed domain errors to the correct HTTP status code.
 */
export function getErrorStatus(err: unknown): number {
  if (err instanceof UserNotFoundError) return 404;
  if (err instanceof RateLimitError) return 429;
  if (err instanceof TokenRequiredError) return 401;
  return 500;
}
