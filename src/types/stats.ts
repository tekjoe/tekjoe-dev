export interface GitHubStats {
  contributions: number;
  repos: number;
  topLanguages: string[];
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
