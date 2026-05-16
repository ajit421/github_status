// src/types/github.ts

// ── REST API Primitives ───────────────────────────────────────────────────────

export interface GitHubUser {
  name: string | null;
  login: string;
  followers: number;
  following: number;
  public_repos: number;
  bio: string | null;
  company: string | null;
  location: string | null;
  avatar_url: string;
  created_at: string;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  languages_url: string;
  owner: {
    login: string;
  };
  html_url: string;
  updated_at: string;
  created_at: string;
  fork: boolean;
  private: boolean;
  default_branch: string;
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
  currentStreakStart?: string;
  currentStreakEnd?: string;
  longestStreakStart?: string;
  longestStreakEnd?: string;
  contributionStart?: string;
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

export interface ContributionGraphData {
  totalContributions: number;
  days: ContributionDay[];
}

// ── New Card Types ────────────────────────────────────────────────────────────

export interface ProfileData {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  avatarUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  joinedYear: string;
  contributionsThisYear: number;
  topLanguages: Array<{ name: string; color: string; percent: number }>;
}

export interface RepoData {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  language: string | null;
  languageColor: string;
  updatedAt: string;
  createdAt: string;
  defaultBranch: string;
  htmlUrl: string;
  isForked: boolean;
  license: string | null;
  topics: string[];
  size: number;
}

export interface ProductiveTimeData {
  byHour: Array<{ hour: number; count: number }>;
  peakHour: number;
  peakCount: number;
  totalCommits: number;
  utcOffset: number;
  mostProductiveRange: string;
}