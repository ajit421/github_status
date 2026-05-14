// src/types/bindings.d.ts

export interface Env {
  /**
   * GitHub Personal Access Token.
   * Set via: wrangler secret put GITHUB_TOKEN
   * Required for GraphQL (streak) endpoint. Optional but strongly recommended
   * for REST endpoints to avoid the 60 req/hr unauthenticated rate limit.
   */
  GITHUB_TOKEN?: string;

  // Uncomment if you add KV namespace binding in wrangler.toml:
  // STATS_KV: KVNamespace;
}
