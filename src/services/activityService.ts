// src/services/activityService.ts
import { githubFetch } from '../lib/github';
import type { GitHubRepo, ActivityData } from '../types/github';
import {
  ACTIVITY_REPOS_PER_PAGE,
  ACTIVITY_REPO_LIMIT,
  ACTIVITY_COMMITS_PER_PAGE,
  GITHUB_FETCH_TIMEOUT_MS,
} from '../config/constants';

interface GitHubCommit {
  commit: { author: { date: string | null } | null };
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export async function fetchCommitActivity(
  username: string,
  token?: string
): Promise<ActivityData> {
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

  // noUncheckedIndexedAccess: Array.from with known length guarantees valid
  // indices, so the non-null assertions below are safe.
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  const byDay  = DAY_NAMES.map((day) => ({ day, count: 0 }));

  for (const commits of commitArrays) {
    for (const item of commits) {
      const dateStr = item.commit.author?.date;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      // Safe: getUTCHours() returns [0,23], getUTCDay() returns [0,6]
      byHour[d.getUTCHours()]!.count++;
      byDay[d.getUTCDay()]!.count++;
    }
  }

  // Safe: byHour has exactly 24 elements, index 0 is always defined.
  const peakHour = byHour.reduce((max, h) => (h.count > max.count ? h : max), byHour[0]!);

  return {
    byHour,
    byDay,
    mostProductiveTime: `${peakHour.hour}:00 UTC`,
  };
}
