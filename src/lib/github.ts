// src/lib/github.ts

const BASE_URL = "https://api.github.com";

function defaultHeaders(): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "github-stats-api/1.0",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ""}`,
  };
}

/**
 * Typed fetch wrapper for the GitHub REST and GraphQL APIs.
 *
 * Rate-limit behaviour:
 *  - Warns (console.warn) when fewer than 10 requests remain.
 *  - Throws when the limit is fully exhausted (403 + remaining === "0").
 *  - Throws a user-friendly error on 404.
 */
export async function githubFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  // ── Rate limit inspection ────────────────────────────────────────────────────
  const remaining = response.headers.get("x-ratelimit-remaining");

  if (remaining !== null && Number(remaining) < 10) {
    console.warn(
      `[github-stats-api] GitHub rate limit low — ${remaining} requests remaining.`
    );
  }

  // ── Error handling ───────────────────────────────────────────────────────────
  if (response.status === 403 && remaining === "0") {
    throw new Error("GitHub API Rate Limit Exceeded");
  }

  if (response.status === 404) {
    throw new Error("User not found");
  }

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}
