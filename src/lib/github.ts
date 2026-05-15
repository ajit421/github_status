// src/lib/github.ts
import {
  GITHUB_API_BASE,
  GITHUB_GRAPHQL_URL,
  GITHUB_API_VERSION,
  GITHUB_USER_AGENT,
} from '../config/constants';
import {
  UserNotFoundError,
  RateLimitError,
  UpstreamApiError,
} from './errors';

export { GITHUB_GRAPHQL_URL };

function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': GITHUB_USER_AGENT,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Typed fetch wrapper for the GitHub REST API.
 *
 * @param path  Absolute URL or path relative to https://api.github.com
 * @param token Optional GitHub PAT
 * @param init  Additional fetch options (method, body, signal, etc.)
 */
export async function githubFetch<T>(
  path: string,
  token?: string,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${GITHUB_API_BASE}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      ...buildHeaders(token),
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  // Rate-limit telemetry
  const remaining = response.headers.get('x-ratelimit-remaining');
  const resetHeader = response.headers.get('x-ratelimit-reset');
  if (remaining !== null && Number(remaining) < 10) {
    console.warn(`[github] ⚠️  Rate limit low — ${remaining} requests remaining`);
  }

  if (response.status === 403 && remaining === '0') {
    const resetAt = resetHeader ? Number(resetHeader) : undefined;
    throw new RateLimitError(resetAt);
  }
  if (response.status === 404) {
    throw new UserNotFoundError();
  }
  if (!response.ok) {
    throw new UpstreamApiError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

/**
 * Typed wrapper for the GitHub GraphQL API.
 * Always requires a token.
 */
export async function githubGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': GITHUB_USER_AGENT,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new UpstreamApiError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}
