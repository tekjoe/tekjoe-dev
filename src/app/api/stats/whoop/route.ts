import { NextResponse } from "next/server";
import type { StatsResponse, WhoopStats } from "@/types/stats";
import { getToken, setToken } from "@/lib/token-store";

export const revalidate = 3600;

const WHOOP_API = "https://api.prod.whoop.com/developer/v2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// In-process cache — persists across requests within a warm instance
let cachedData: WhoopStats | null = null;
let cachedAt: string | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const refreshToken = await getToken("whoop_refresh_token");

  // Prefer refresh token flow
  if (clientId && clientSecret && refreshToken) {
    const res = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      // Persist new tokens (handles rotation automatically)
      if (data.access_token) await setToken("whoop_access_token", data.access_token);
      if (data.refresh_token) await setToken("whoop_refresh_token", data.refresh_token);
      return data.access_token;
    }
    // Fall through to cached access token if refresh fails
  }

  // Try cached access token from token store
  const accessToken = await getToken("whoop_access_token");
  if (accessToken) return accessToken;

  throw new Error(
    "No Whoop credentials configured. Visit /api/auth/whoop to connect your account."
  );
}

export async function GET() {
  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [recoveryRes, sleepRes, cycleRes] = await Promise.all([
      fetch(`${WHOOP_API}/recovery?limit=1`, { headers }),
      fetch(`${WHOOP_API}/activity/sleep?limit=1`, { headers }),
      fetch(`${WHOOP_API}/cycle?limit=1`, { headers }),
    ]);

    if (!recoveryRes.ok || !sleepRes.ok || !cycleRes.ok) {
      const statuses = `recovery:${recoveryRes.status} sleep:${sleepRes.status} cycle:${cycleRes.status}`;
      throw new Error(`Whoop API request failed (${statuses})`);
    }

    const recoveryData = await recoveryRes.json();
    const sleepData = await sleepRes.json();
    const cycleData = await cycleRes.json();

    const latestRecovery = recoveryData.records?.[0]?.score;
    const latestSleep = sleepData.records?.[0]?.score;
    const latestCycle = cycleData.records?.[0]?.score;

    const data: WhoopStats = {
      recovery: latestRecovery?.recovery_score ?? 0,
      strain: latestCycle?.strain ?? 0,
      sleepHours: latestSleep?.stage_summary
        ? Math.round(
            ((latestSleep.stage_summary.total_in_bed_time_milli || 0) / 3600000) * 10
          ) / 10
        : 0,
    };

    // Cache successful result
    cachedData = data;
    cachedAt = new Date().toISOString();

    const response: StatsResponse<WhoopStats> = {
      data,
      lastUpdated: cachedAt,
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    // Return cached data if available instead of failing
    if (cachedData) {
      const response: StatsResponse<WhoopStats> = {
        data: cachedData,
        lastUpdated: cachedAt || new Date().toISOString(),
      };
      return NextResponse.json(response, { headers: corsHeaders });
    }

    const response: StatsResponse<WhoopStats> = {
      data: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500, headers: corsHeaders });
  }
}
