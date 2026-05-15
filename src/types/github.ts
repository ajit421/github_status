// src/types/github.d.ts

// ── REST API Primitives ───────────────────────────────────────────────────────

export interface GitHubUser {
  name: string | null;
  login: string;
  followers: number;
}

export interface GitHubRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  languages_url: string;
  owner: {
    login: string;
  };
}

export interface CommitSearchResult {
  total_count: number;
}

// ── GraphQL ───────────────────────────────────────────────────────────────────

export interface GraphQLContributionResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: ContributionDay[];
          }>;
        };
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalIssueContributions: number;
      };
    };
  };
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

// ── Derived / Computed Types ──────────────────────────────────────────────────

export interface StreakData {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
}

export interface StatsData {
  name: string | null;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  rank: string;
}

/** Keys are language names (e.g. "TypeScript"); values hold byte size and display colour. */
export type LanguageData = Record<string, { size: number; color: string }>;

export interface ActivityData {
  byHour: Array<{ hour: number; count: number }>;
  byDay: Array<{ day: string; count: number }>;
  mostProductiveTime: string;
}
