import { NextResponse } from "next/server";
import type { StatsResponse, StravaStats } from "@/types/stats";
import { getToken, setToken } from "@/lib/token-store";

export const revalidate = 3600;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// In-process cache — persists across requests within a warm instance
let cachedData: StravaStats | null = null;
let cachedAt: string | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = await getToken("strava_refresh_token");

  // Prefer refresh token flow
  if (clientId && clientSecret && refreshToken) {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Strava token refresh failed (${res.status}): ${body}`);
    }
    const data = await res.json();
    // Persist tokens (Strava refresh tokens don't rotate, but store defensively)
    if (data.access_token) await setToken("strava_access_token", data.access_token);
    if (data.refresh_token) await setToken("strava_refresh_token", data.refresh_token);
    return data.access_token;
  }

  // Try cached access token from token store
  const accessToken = await getToken("strava_access_token");
  if (accessToken) return accessToken;

  throw new Error(
    "No Strava credentials configured. Visit /api/auth/strava to connect your account."
  );
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
    if (!athleteRes.ok) throw new Error(`Strava athlete API returned ${athleteRes.status}`);
    const athlete = await athleteRes.json();

    const statsRes = await fetch(
      `https://www.strava.com/api/v3/athletes/${athlete.id}/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!statsRes.ok) throw new Error(`Strava stats API returned ${statsRes.status}`);
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

    // Cache successful result
    cachedData = data;
    cachedAt = new Date().toISOString();

    const response: StatsResponse<StravaStats> = {
      data,
      lastUpdated: cachedAt,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    // Return cached data if available instead of failing
    if (cachedData) {
      const response: StatsResponse<StravaStats> = {
        data: cachedData,
        lastUpdated: cachedAt || new Date().toISOString(),
      };
      return NextResponse.json(response, { headers: corsHeaders });
    }

    const response: StatsResponse<StravaStats> = {
      data: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500, headers: corsHeaders });
  }
}
