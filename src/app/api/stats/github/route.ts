import { NextResponse } from "next/server";
import type {
  StatsResponse,
  GitHubStats,
  ContributionWeek,
} from "@/types/stats";

export const revalidate = 3600;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const USERNAMES = ["tekjoe", "joeramirez-verano"];
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const ghHeaders: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
};
const fetchOpts = { headers: ghHeaders, next: { revalidate: 3600 } as const };

// ─── GraphQL: contributions this year ────────────────────────────────

const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
            }
          }
        }
      }
    }
  }
`;

const LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface ContributionsResult {
  total: number;
  weeks: ContributionWeek[];
}

async function fetchContributions(
  username: string
): Promise<ContributionsResult> {
  if (!GITHUB_TOKEN) return { total: 0, weeks: [] };

  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const from = oneYearAgo.toISOString();
  const to = now.toISOString();

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { username, from, to },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return { total: 0, weeks: [] };

  const json = await res.json();
  const calendar =
    json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return { total: 0, weeks: [] };

  const weeks: ContributionWeek[] = calendar.weeks.map(
    (w: {
      contributionDays: {
        contributionCount: number;
        contributionLevel: string;
        date: string;
      }[];
    }) => ({
      days: w.contributionDays.map(
        (d: {
          contributionCount: number;
          contributionLevel: string;
          date: string;
        }) => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVEL_MAP[d.contributionLevel] ?? 0,
        })
      ),
    })
  );

  return { total: calendar.totalContributions ?? 0, weeks };
}

// ─── REST: repos, languages, stars ───────────────────────────────────

const noAuthOpts = {
  headers: { Accept: "application/vnd.github.v3+json" },
  next: { revalidate: 3600 } as const,
};

async function fetchUserStats(username: string) {
  let [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, fetchOpts),
    fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      fetchOpts
    ),
  ]);

  // Retry without auth if token is invalid
  if (userRes.status === 401 || reposRes.status === 401) {
    [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, noAuthOpts),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        noAuthOpts
      ),
    ]);
  }

  if (!userRes.ok || !reposRes.ok) {
    throw new Error(
      `GitHub API failed for ${username} (${userRes.status}/${reposRes.status})`
    );
  }

  const user = await userRes.json();
  const repos = await reposRes.json();

  const stars = (repos as { stargazers_count: number }[]).reduce(
    (sum, r) => sum + (r.stargazers_count || 0),
    0
  );

  return { repoCount: user.public_repos as number, repos, stars };
}

// ─── GET handler ─────────────────────────────────────────────────────

export async function GET() {
  try {
    const [restSettled, ...contribSettled] = await Promise.allSettled([
      Promise.allSettled(USERNAMES.map(fetchUserStats)),
      ...USERNAMES.map(fetchContributions),
    ]);

    let totalRepos = 0;
    let totalStars = 0;
    const langCounts: Record<string, number> = {};

    const restResults =
      restSettled.status === "fulfilled" ? restSettled.value : [];
    for (const result of restResults) {
      if (result.status !== "fulfilled") continue;
      const { repoCount, repos, stars } = result.value;
      totalRepos += repoCount;
      totalStars += stars;
      for (const repo of repos) {
        if (repo.language) {
          langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        }
      }
    }

    const contribResults: ContributionsResult[] = contribSettled.map((r) =>
      r.status === "fulfilled" ? r.value : { total: 0, weeks: [] }
    ) as ContributionsResult[];

    const contributionsLastYear = contribResults.reduce(
      (sum, c) => sum + c.total,
      0
    );

    // Merge calendars: use the primary account's calendar as base
    const primaryCalendar = contribResults[0]?.weeks ?? [];
    if (contribResults.length > 1) {
      const secondaryByDate = new Map<string, number>();
      for (let i = 1; i < contribResults.length; i++) {
        for (const week of contribResults[i]?.weeks ?? []) {
          for (const day of week.days) {
            secondaryByDate.set(
              day.date,
              (secondaryByDate.get(day.date) || 0) + day.count
            );
          }
        }
      }
      for (const week of primaryCalendar) {
        for (const day of week.days) {
          const extra = secondaryByDate.get(day.date) || 0;
          day.count += extra;
          if (day.count === 0) day.level = 0;
          else if (day.count <= 3) day.level = 1;
          else if (day.count <= 6) day.level = 2;
          else if (day.count <= 9) day.level = 3;
          else day.level = 4;
        }
      }
    }

    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    const data: GitHubStats = {
      contributions: contributionsLastYear || totalRepos,
      repos: totalRepos,
      topLanguages,
      contributionsLastYear,
      totalStars,
      contributionCalendar: primaryCalendar,
    };

    const response: StatsResponse<GitHubStats> = {
      data,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    const response: StatsResponse<GitHubStats> = {
      data: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500, headers: corsHeaders });
  }
}
