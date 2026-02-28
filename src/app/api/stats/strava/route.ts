import { NextResponse } from "next/server";
import type { StatsResponse, StravaStats } from "@/types/stats";

export const revalidate = 3600;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

async function getAccessToken(): Promise<string> {
  if (process.env.STRAVA_ACCESS_TOKEN) {
    return process.env.STRAVA_ACCESS_TOKEN;
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Strava token refresh failed");
  const data = await res.json();
  return data.access_token;
}

function metersToMiles(meters: number): number {
  return Math.round((meters / 1609.344) * 10) / 10;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const athlete = await athleteRes.json();

    const statsRes = await fetch(
      `https://www.strava.com/api/v3/athletes/${athlete.id}/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const stats = await statsRes.json();

    const allRunTotals = stats.all_run_totals || {};
    const allRideTotals = stats.all_ride_totals || {};
    const ytdRideTotals = stats.ytd_ride_totals || {};
    const ytdRunTotals = stats.ytd_run_totals || {};

    const totalDistance = metersToMiles(
      (allRunTotals.distance || 0) + (allRideTotals.distance || 0)
    );
    const ytdDistance = metersToMiles(
      (ytdRideTotals.distance || 0) + (ytdRunTotals.distance || 0)
    );
    const recentRideCount = stats.recent_ride_totals?.count || 0;

    const data: StravaStats = {
      totalDistance,
      recentRideCount,
      ytdDistance,
    };

    const response: StatsResponse<StravaStats> = {
      data,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    const response: StatsResponse<StravaStats> = {
      data: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500, headers: corsHeaders });
  }
}
