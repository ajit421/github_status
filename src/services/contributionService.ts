// src/services/contributionService.ts
import { githubGraphQL } from '../lib/github';
import type {
  GraphQLContributionResponse,
  ContributionDay,
  StreakData,
} from '../types/github';

const CONTRIBUTION_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

function calcCurrentStreak(days: ContributionDay[]): number {
  const today = new Date().toISOString().split('T')[0]!;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i]!;
    if (day.date === today && day.contributionCount === 0) continue;
    if (day.contributionCount === 0) break;
    streak++;
  }
  return streak;
}

function calcLongestStreak(days: ContributionDay[]): number {
  let longest = 0;
  let current = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      if (++current > longest) longest = current;
    } else {
      current = 0;
    }
  }
  return longest;
}

export async function fetchContributionData(
  username: string,
  token?: string
): Promise<StreakData> {
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN is required for streak data. ' +
      'Set it via: wrangler secret put GITHUB_TOKEN'
    );
  }

  const json = await githubGraphQL<GraphQLContributionResponse>(
    CONTRIBUTION_QUERY,
    { login: username },
    token
  );

  if (!json.data?.user) {
    throw new Error(`User '${username}' not found via GraphQL`);
  }

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const allDays: ContributionDay[] = calendar.weeks.flatMap((w) => w.contributionDays);

  return {
    totalContributions: calendar.totalContributions,
    currentStreak:      calcCurrentStreak(allDays),
    longestStreak:      calcLongestStreak(allDays),
  };
}
