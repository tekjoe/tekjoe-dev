export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface GitHubStats {
  contributions: number;
  repos: number;
  topLanguages: string[];
  contributionsLastYear: number;
  totalStars: number;
  contributionCalendar: ContributionWeek[];
}

export interface StravaStats {
  totalDistance: number;
  recentRideCount: number;
  ytdDistance: number;
}

export interface WhoopStats {
  recovery: number;
  strain: number;
  sleepHours: number;
}

export interface StatsResponse<T> {
  data: T | null;
  lastUpdated: string;
  error?: string;
}

export interface AllStats {
  github: StatsResponse<GitHubStats>;
  strava: StatsResponse<StravaStats>;
  whoop: StatsResponse<WhoopStats>;
}
