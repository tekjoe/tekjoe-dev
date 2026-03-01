import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.WHOOP_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "WHOOP_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/whoop/callback`;
  const scope =
    "read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement";

  const authUrl = new URL("https://api.prod.whoop.com/oauth/oauth2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);

  return NextResponse.redirect(authUrl.toString());
}
