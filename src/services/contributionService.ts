// src/services/contributionService.ts
import type {
  GraphQLContributionResponse,
  ContributionDay,
  StreakData,
} from '../types/github';

const GRAPHQL_URL = "https://api.github.com/graphql";

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
  const today = new Date().toISOString().split("T")[0]!;
  let streak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i]!;
    // Skip today if no contributions yet
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
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }

  return longest;
}

export async function fetchContributionData(
  username: string
): Promise<StreakData> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is required for contribution data (GraphQL API)"
    );
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "github-stats-api/1.0",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { login: username },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL error: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as GraphQLContributionResponse;

  if (!json.data?.user) {
    throw new Error(`User '${username}' not found via GraphQL`);
  }

  const calendar =
    json.data.user.contributionsCollection.contributionCalendar;

  const allDays: ContributionDay[] = calendar.weeks.flatMap(
    (week) => week.contributionDays
  );

  return {
    totalContributions: calendar.totalContributions,
    currentStreak: calcCurrentStreak(allDays),
    longestStreak: calcLongestStreak(allDays),
  };
}
