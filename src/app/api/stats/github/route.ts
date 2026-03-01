import { NextResponse } from "next/server";
import type { StatsResponse, GitHubStats } from "@/types/stats";

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

const ghHeaders = { Accept: "application/vnd.github.v3+json" };
const fetchOpts = { headers: ghHeaders, next: { revalidate: 3600 } as const };

async function fetchUserStats(username: string) {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, fetchOpts),
    fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      fetchOpts
    ),
  ]);

  if (!userRes.ok || !reposRes.ok) {
    throw new Error(`GitHub API failed for ${username} (${userRes.status}/${reposRes.status})`);
  }

  const user = await userRes.json();
  const repos = await reposRes.json();

  return { repoCount: user.public_repos as number, repos };
}

export async function GET() {
  try {
    const results = await Promise.all(USERNAMES.map(fetchUserStats));

    let totalRepos = 0;
    const langCounts: Record<string, number> = {};

    for (const { repoCount, repos } of results) {
      totalRepos += repoCount;
      for (const repo of repos) {
        if (repo.language) {
          langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        }
      }
    }

    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    const data: GitHubStats = {
      contributions: totalRepos,
      repos: totalRepos,
      topLanguages,
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
