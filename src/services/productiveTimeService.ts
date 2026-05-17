// src/services/productiveTimeService.ts
import { githubFetch } from '../lib/github';
import type { GitHubRepo, ProductiveTimeData } from '../types/github';
import {
  ACTIVITY_REPOS_PER_PAGE,
  ACTIVITY_REPO_LIMIT,
  ACTIVITY_COMMITS_PER_PAGE,
  GITHUB_FETCH_TIMEOUT_MS,
} from '../config/constants';

interface GitHubCommit {
  commit: { author: { date: string | null } | null };
}

export async function fetchProductiveTime(
  username: string,
  utcOffset: number,
  token?: string
): Promise<ProductiveTimeData> {
  const signal = AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS);

  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=updated&per_page=${ACTIVITY_REPOS_PER_PAGE}&type=owner`,
    token,
    { signal }
  );

  const top = repos.slice(0, ACTIVITY_REPO_LIMIT);

  const commitArrays = await Promise.all(
    top.map((repo) =>
      githubFetch<GitHubCommit[]>(
        `/repos/${repo.owner.login}/${repo.name}/commits?per_page=${ACTIVITY_COMMITS_PER_PAGE}`,
        token,
        { signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS) }
      ).catch((): GitHubCommit[] => [])
    )
  );

  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));

  let totalCommits = 0;
  for (const commits of commitArrays) {
    for (const item of commits) {
      const dateStr = item.commit.author?.date;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      // Apply UTC offset: utcOffset is in hours (e.g. +5.5 for IST)
      const localHour = ((d.getUTCHours() + utcOffset) % 24 + 24) % 24;
      const hourIndex = Math.floor(localHour);
      byHour[hourIndex]!.count++;
      totalCommits++;
    }
  }

  const peakBar = byHour.reduce((max, h) => (h.count > max.count ? h : max), byHour[0]!);
  const peakHour = peakBar.hour;
  const peakCount = peakBar.count;

  // Determine most productive range (morning/afternoon/evening/night)
  let mostProductiveRange = 'Morning';
  if (peakHour >= 5 && peakHour < 12) mostProductiveRange = 'Morning';
  else if (peakHour >= 12 && peakHour < 17) mostProductiveRange = 'Afternoon';
  else if (peakHour >= 17 && peakHour < 21) mostProductiveRange = 'Evening';
  else mostProductiveRange = 'Night';

  return {
    byHour,
    peakHour,
    peakCount,
    totalCommits,
    utcOffset,
    mostProductiveRange,
  };
}
