// src/services/statsService.ts
import { githubFetch } from '../lib/github';
import type {
  GitHubUser,
  GitHubRepo,
  CommitSearchResult,
  StatsData,
} from '../types/github';

interface IssueSearchResult {
  total_count: number;
}

function calcRank(score: number): string {
  if (score > 2000) return "S";
  if (score > 1000) return "A+";
  if (score > 500) return "A";
  if (score > 200) return "B+";
  if (score > 100) return "B";
  return "C";
}

export async function getStats(username: string): Promise<StatsData> {
  const [user, repos, commitSearch] = await Promise.all([
    githubFetch<GitHubUser>(`/users/${username}`),
    githubFetch<GitHubRepo[]>(
      `/users/${username}/repos?per_page=100&type=owner`
    ),
    githubFetch<CommitSearchResult>(
      `/search/commits?q=author:${username}&per_page=1`
    ),
  ]);

  const [prSearch, issueSearch] = await Promise.all([
    githubFetch<IssueSearchResult>(
      `/search/issues?q=author:${username}+type:pr&per_page=1`
    ),
    githubFetch<IssueSearchResult>(
      `/search/issues?q=author:${username}+type:issue&per_page=1`
    ),
  ]);

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );
  const totalCommits = commitSearch.total_count;
  const totalPRs = prSearch.total_count;
  const totalIssues = issueSearch.total_count;
  const followers = user.followers;

  const score =
    totalStars * 2 + totalCommits + totalPRs * 3 + totalIssues + followers;

  return {
    name: user.name,
    totalStars,
    totalCommits,
    totalPRs,
    totalIssues,
    rank: calcRank(score),
  };
}
