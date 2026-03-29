// src/services/activityService.ts
import { githubFetch } from "@/lib/github";
import type { GitHubRepo, ActivityData } from "@/types/github";

interface GitHubCommit {
  commit: {
    author: {
      date: string | null;
    } | null;
  };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export async function fetchCommitActivity(
  username: string
): Promise<ActivityData> {
  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=updated&per_page=20&type=owner`
  );

  const top5 = repos.slice(0, 5);

  const commitArrays = await Promise.all(
    top5.map((repo) =>
      githubFetch<GitHubCommit[]>(
        `/repos/${repo.owner.login}/${repo.name}/commits?per_page=20`
      ).catch((): GitHubCommit[] => []) // per-repo errors must not abort the whole request
    )
  );

  const byHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
  }));
  const byDay = DAY_NAMES.map((day) => ({ day, count: 0 }));

  for (const commits of commitArrays) {
    for (const item of commits) {
      const dateStr = item.commit.author?.date;
      if (!dateStr) continue;

      const d = new Date(dateStr);
      byHour[d.getUTCHours()]!.count++;
      byDay[d.getUTCDay()]!.count++;
    }
  }

  const peakHour = byHour.reduce(
    (max, h) => (h.count > max.count ? h : max),
    byHour[0]!
  );

  return {
    byHour,
    byDay,
    mostProductiveTime: `${peakHour.hour}:00`,
  };
}
