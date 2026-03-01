import { NextRequest, NextResponse } from "next/server";
import { setToken } from "@/lib/token-store";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `Strava authorization denied: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code received" },
      { status: 400 }
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Strava credentials not configured" },
      { status: 500 }
    );
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: `Token exchange failed (${res.status}): ${body}` },
      { status: 500 }
    );
  }

  const data = await res.json();

  if (data.access_token) {
    await setToken("strava_access_token", data.access_token);
  }
  if (data.refresh_token) {
    await setToken("strava_refresh_token", data.refresh_token);
  }

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><title>Strava Connected</title></head>
<body style="font-family:system-ui;padding:40px;background:#0a0a0f;color:#fff;">
  <h1 style="color:#FED801;">Strava Connected</h1>
  <p>Tokens saved. Your Strava data will now refresh automatically.</p>
  <p style="margin-top:24px;"><a href="/" style="color:#FED801;">Return to site</a></p>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
