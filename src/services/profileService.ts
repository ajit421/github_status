// src/services/profileService.ts
import { githubFetch, githubGraphQL } from '../lib/github';
import type { GitHubUser, GitHubRepo, CommitSearchResult, ProfileData } from '../types/github';
import {
  REPOS_PER_PAGE,
  LANG_TOP_N,
  LANGUAGE_COLORS,
  LANG_COLOR_FALLBACK,
  GITHUB_FETCH_TIMEOUT_MS,
} from '../config/constants';

interface IssueSearchResult {
  total_count: number;
}

interface GraphQLContribResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
        };
      };
    } | null;
  };
}

const CONTRIB_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
      }
    }
  }
}`;

export async function fetchProfileData(username: string, token?: string): Promise<ProfileData> {
  const signal = () => ({ signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS) });

  const [user, repos, commitSearch] = await Promise.all([
    githubFetch<GitHubUser>(`/users/${username}`, token, signal()),
    githubFetch<GitHubRepo[]>(
      `/users/${username}/repos?per_page=${REPOS_PER_PAGE}&sort=updated&type=owner`,
      token,
      signal()
    ),
    githubFetch<CommitSearchResult>(
      `/search/commits?q=author:${username}&per_page=1`,
      token,
      signal()
    ),
  ]);

  const [prSearch, issueSearch] = await Promise.all([
    githubFetch<IssueSearchResult>(
      `/search/issues?q=author:${username}+type:pr&per_page=1`,
      token,
      signal()
    ),
    githubFetch<IssueSearchResult>(
      `/search/issues?q=author:${username}+type:issue&per_page=1`,
      token,
      signal()
    ),
  ]);

  // Aggregate language bytes
  const langBytes: Record<string, number> = {};
  const topRepos = repos.slice(0, 10);

  const langMaps = await Promise.all(
    topRepos.map((repo) =>
      githubFetch<Record<string, number>>(repo.languages_url, token, {
        signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS),
      }).catch(() => ({} as Record<string, number>))
    )
  );

  for (const langMap of langMaps) {
    for (const [lang, bytes] of Object.entries(langMap)) {
      langBytes[lang] = (langBytes[lang] ?? 0) + bytes;
    }
  }

  const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0);
  const topLanguages = Object.entries(langBytes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, LANG_TOP_N)
    .map(([name, bytes]) => ({
      name,
      color: LANGUAGE_COLORS[name] ?? LANG_COLOR_FALLBACK,
      percent: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
    }));

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const joinedYear = new Date(user.created_at).getFullYear().toString();

  // Contributions this year
  let contributionsThisYear = 0;
  if (token) {
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1).toISOString();
      const to = now.toISOString();
      const json = await githubGraphQL<GraphQLContribResponse>(
        CONTRIB_QUERY,
        { login: username, from, to },
        token,
        { signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS) }
      );
      contributionsThisYear =
        json.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0;
    } catch {
      contributionsThisYear = 0;
    }
  }

  return {
    login: user.login,
    name: user.name,
    bio: user.bio,
    company: user.company,
    location: user.location,
    avatarUrl: user.avatar_url,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    totalStars,
    totalCommits: commitSearch.total_count,
    totalPRs: prSearch.total_count,
    totalIssues: issueSearch.total_count,
    joinedYear,
    contributionsThisYear,
    topLanguages,
  };
}
