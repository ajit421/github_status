// src/services/contributionService.ts
import { githubGraphQL } from '../lib/github';
import { TokenRequiredError, UserNotFoundError } from '../lib/errors';
import type {
  GraphQLContributionResponse,
  ContributionDay,
  StreakData,
} from '../types/github';
import { GITHUB_FETCH_TIMEOUT_MS } from '../config/constants';

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
  // `today` is the current date in UTC ISO format (YYYY-MM-DD).
  // Safe: ISO strings always contain 'T', so [0] is always defined.
  const today = new Date().toISOString().split('T')[0]!;
  let streak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    // noUncheckedIndexedAccess: `days[i]` is always defined because loop
    // bounds guarantee i is within [0, days.length - 1].
    const day = days[i]!;

    // Edge case: a user contributed today, but the GitHub calendar may not
    // have updated yet (timezone boundary where UTC date ≠ local date).
    // We skip today's entry if it shows 0 to avoid resetting a live streak.
    if (day.date === today && day.contributionCount === 0) continue;

    if (day.contributionCount === 0) break;
    streak++;
  }

  // Safe fallback: if streak somehow exceeds total days, cap it.
  return Math.min(streak, days.length);
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
    throw new TokenRequiredError();
  }

  const json = await githubGraphQL<GraphQLContributionResponse>(
    CONTRIBUTION_QUERY,
    { login: username },
    token,
    { signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS) }
  );

  if (!json.data?.user) {
    throw new UserNotFoundError(`User '${username}' not found via GraphQL`);
  }

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const allDays: ContributionDay[] = calendar.weeks.flatMap((w) => w.contributionDays);

  return {
    totalContributions: calendar.totalContributions,
    currentStreak:      calcCurrentStreak(allDays),
    longestStreak:      calcLongestStreak(allDays),
  };
}
