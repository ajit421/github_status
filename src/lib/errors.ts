// src/lib/errors.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed error hierarchy for the GitHub Stats API.
// Throwing typed errors instead of `new Error(string)` lets route catch blocks
// pattern-match on error class and return the correct HTTP status code.
// ─────────────────────────────────────────────────────────────────────────────

/** Base class for all domain errors in this service. */
export class GitHubStatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubStatsError';
  }
}

/**
 * Thrown when a GitHub user cannot be found (REST 404 or GraphQL null user).
 * Also thrown when the `username` query parameter is missing.
 * → HTTP 404
 */
export class UserNotFoundError extends GitHubStatsError {
  constructor(message = 'GitHub user not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Thrown when the GitHub API rate limit is exhausted (REST 403 + remaining=0).
 * `resetTimestamp` is the Unix epoch second at which the limit resets,
 * sourced from the `x-ratelimit-reset` response header.
 * → HTTP 429 + Retry-After header
 */
export class RateLimitError extends GitHubStatsError {
  public readonly resetTimestamp: number | null;

  constructor(resetTimestamp?: number) {
    super(
      'GitHub API rate limit exceeded. ' +
      'Add a GITHUB_TOKEN to raise the limit to 5 000 req/hr.'
    );
    this.name = 'RateLimitError';
    this.resetTimestamp = resetTimestamp ?? null;
  }
}

/**
 * Thrown when a GraphQL endpoint is called without a GITHUB_TOKEN.
 * → HTTP 401
 */
export class TokenRequiredError extends GitHubStatsError {
  constructor() {
    super(
      'GITHUB_TOKEN is required for this endpoint. ' +
      'Set it via: wrangler secret put GITHUB_TOKEN'
    );
    this.name = 'TokenRequiredError';
  }
}

/**
 * Thrown for any non-200 response from the GitHub API that is not
 * a rate-limit or not-found condition.
 * → HTTP 500
 */
export class UpstreamApiError extends GitHubStatsError {
  public readonly httpStatus: number;

  constructor(httpStatus: number, statusText: string) {
    super(`GitHub API error: ${httpStatus} ${statusText}`);
    this.name = 'UpstreamApiError';
    this.httpStatus = httpStatus;
  }
}
