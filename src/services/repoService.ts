// src/services/repoService.ts
import { githubFetch } from '../lib/github';
import type { GitHubRepo, RepoData } from '../types/github';
import { LANGUAGE_COLORS, LANG_COLOR_FALLBACK, GITHUB_FETCH_TIMEOUT_MS } from '../config/constants';

interface GitHubRepoFull extends GitHubRepo {
  license: { name: string } | null;
  topics: string[];
  size: number;
}

export async function fetchRepoData(username: string, repo: string, token?: string): Promise<RepoData> {
  const signal = AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS);

  const data = await githubFetch<GitHubRepoFull>(
    `/repos/${username}/${repo}`,
    token,
    { signal }
  );

  return {
    name: data.name,
    fullName: `${data.owner.login}/${data.name}`,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count,
    language: data.language,
    languageColor: data.language ? (LANGUAGE_COLORS[data.language] ?? LANG_COLOR_FALLBACK) : LANG_COLOR_FALLBACK,
    updatedAt: data.updated_at,
    createdAt: data.created_at,
    defaultBranch: data.default_branch,
    htmlUrl: data.html_url,
    isForked: data.fork,
    license: data.license?.name ?? null,
    topics: data.topics ?? [],
    size: data.size,
  };
}

export async function fetchUserRepos(username: string, token?: string): Promise<string[]> {
  const signal = AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS);
  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?per_page=100&sort=updated&type=owner`,
    token,
    { signal }
  );
  return repos.map((r) => r.name);
}
