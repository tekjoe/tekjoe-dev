import { NextResponse } from "next/server";
import type { StatsResponse, WhoopStats } from "@/types/stats";

export const revalidate = 3600;

const WHOOP_API = "https://api.prod.whoop.com/developer/v2";

async function getAccessToken(): Promise<string> {
  if (process.env.WHOOP_ACCESS_TOKEN) {
    return process.env.WHOOP_ACCESS_TOKEN;
  }

  if (process.env.WHOOP_REFRESH_TOKEN) {
    const res = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.WHOOP_CLIENT_ID || "",
        client_secret: process.env.WHOOP_CLIENT_SECRET || "",
        refresh_token: process.env.WHOOP_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) throw new Error("Whoop token refresh failed");
    const data = await res.json();
    return data.access_token;
  }

  throw new Error("No Whoop credentials configured");
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
      throw new Error("Whoop API request failed");
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

    const response: StatsResponse<WhoopStats> = {
      data,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: StatsResponse<WhoopStats> = {
      data: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
