// src/lib/github.ts

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export { GITHUB_GRAPHQL_URL };

function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'github-stats-api/2.0 (Cloudflare-Workers)',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Typed fetch wrapper for the GitHub REST API.
 *
 * @param path   Absolute URL or path relative to https://api.github.com
 * @param token  Optional GitHub Personal Access Token
 * @param init   Additional fetch options (method, body, etc.)
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
  if (remaining !== null && Number(remaining) < 10) {
    console.warn(`[github] ⚠️  Rate limit low — ${remaining} requests remaining`);
  }

  if (response.status === 403 && remaining === '0') {
    throw new Error('GitHub API Rate Limit Exceeded. Add a GITHUB_TOKEN to increase limits.');
  }
  if (response.status === 404) {
    throw new Error(`GitHub user not found`);
  }
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
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
  token: string
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'github-stats-api/2.0 (Cloudflare-Workers)',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
