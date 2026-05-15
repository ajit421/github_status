// src/services/statsService.ts
import { githubFetch } from '../lib/github';
import type { GitHubUser, GitHubRepo, CommitSearchResult, StatsData } from '../types/github';
import { REPOS_PER_PAGE, GITHUB_FETCH_TIMEOUT_MS } from '../config/constants';

interface IssueSearchResult {
  total_count: number;
}

function calcRank(score: number): string {
  if (score > 2000) return 'S';
  if (score > 1000) return 'A+';
  if (score > 500)  return 'A';
  if (score > 200)  return 'B+';
  if (score > 100)  return 'B';
  return 'C';
}

export async function getStats(username: string, token?: string): Promise<StatsData> {
  // AbortSignal.timeout ensures no single fetch can stall the Worker beyond
  // the CPU time limit. 8 s gives GitHub enough headroom on slow days.
  const signal = () => ({ signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS) });

  const [user, repos, commitSearch] = await Promise.all([
    githubFetch<GitHubUser>(`/users/${username}`, token, signal()),
    githubFetch<GitHubRepo[]>(`/users/${username}/repos?per_page=${REPOS_PER_PAGE}&type=owner`, token, signal()),
    githubFetch<CommitSearchResult>(`/search/commits?q=author:${username}&per_page=1`, token, signal()),
  ]);

  const [prSearch, issueSearch] = await Promise.all([
    githubFetch<IssueSearchResult>(`/search/issues?q=author:${username}+type:pr&per_page=1`, token, signal()),
    githubFetch<IssueSearchResult>(`/search/issues?q=author:${username}+type:issue&per_page=1`, token, signal()),
  ]);

  const totalStars   = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalCommits = commitSearch.total_count;
  const totalPRs     = prSearch.total_count;
  const totalIssues  = issueSearch.total_count;
  const followers    = user.followers;

  const score = totalStars * 2 + totalCommits + totalPRs * 3 + totalIssues + followers;

  return {
    name: user.name,
    totalStars,
    totalCommits,
    totalPRs,
    totalIssues,
    rank: calcRank(score),
  };
}
