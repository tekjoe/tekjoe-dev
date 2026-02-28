"use client";

import { useState, useEffect } from "react";
import type {
  StatsResponse,
  GitHubStats,
  StravaStats,
  WhoopStats,
} from "@/types/stats";

export interface AllStats {
  github: StatsResponse<GitHubStats>;
  strava: StatsResponse<StravaStats>;
  whoop: StatsResponse<WhoopStats>;
}

const fallback = <T,>(): StatsResponse<T> => ({
  data: null,
  lastUpdated: new Date().toISOString(),
  error: "Not loaded",
});

export function useStats() {
  const [stats, setStats] = useState<AllStats>({
    github: fallback(),
    strava: fallback(),
    whoop: fallback(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [github, strava, whoop] = await Promise.allSettled([
        fetch("/api/stats/github").then((r) => r.json()),
        fetch("/api/stats/strava").then((r) => r.json()),
        fetch("/api/stats/whoop").then((r) => r.json()),
      ]);

      setStats({
        github:
          github.status === "fulfilled" ? github.value : fallback<GitHubStats>(),
        strava:
          strava.status === "fulfilled" ? strava.value : fallback<StravaStats>(),
        whoop:
          whoop.status === "fulfilled" ? whoop.value : fallback<WhoopStats>(),
      });
      setLoading(false);
    }
    fetchAll();
  }, []);

  return { stats, loading };
}
