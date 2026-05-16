// src/services/activityGraphService.ts
import { githubGraphQL } from '../lib/github';
import { TokenRequiredError, UserNotFoundError } from '../lib/errors';
import type {
  GraphQLContributionResponse,
  ContributionGraphData,
} from '../types/github';
import { GITHUB_FETCH_TIMEOUT_MS } from '../config/constants';

const CONTRIBUTION_GRAPH_QUERY = `
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

export async function fetchActivityGraphData(
  username: string,
  token?: string
): Promise<ContributionGraphData> {
  if (!token) {
    throw new TokenRequiredError();
  }

  const json = await githubGraphQL<GraphQLContributionResponse>(
    CONTRIBUTION_GRAPH_QUERY,
    { login: username },
    token,
    { signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS) }
  );

  if (!json.data?.user) {
    throw new UserNotFoundError(`User '${username}' not found via GraphQL`);
  }

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const allDays = calendar.weeks.flatMap((w) => w.contributionDays);

  // Return only the last 31 days for a monthly view
  const days = allDays.slice(-31);

  return {
    totalContributions: calendar.totalContributions,
    days,
  };
}
