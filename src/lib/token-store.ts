/**
 * Token Store — Multi-layer OAuth token persistence.
 *
 * Read order:
 *   1. In-memory cache (survives within warm serverless instances)
 *   2. Upstash Redis via REST API (persistent across cold starts, optional)
 *   3. process.env fallback
 *
 * Write order:
 *   1. In-memory cache (immediate)
 *   2. Upstash Redis (if configured)
 */

const tokenCache = new Map<string, string>();

const ENV_KEY_MAP: Record<string, string> = {
  whoop_refresh_token: "WHOOP_REFRESH_TOKEN",
  whoop_access_token: "WHOOP_ACCESS_TOKEN",
  strava_refresh_token: "STRAVA_REFRESH_TOKEN",
  strava_access_token: "STRAVA_ACCESS_TOKEN",
};

// ── Upstash Redis (optional persistent layer) ──────────────────────

function upstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function getFromUpstash(key: string): Promise<string | null> {
  if (!upstashConfigured()) return null;
  try {
    const res = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch {
    return null;
  }
}

async function setInUpstash(key: string, value: string): Promise<void> {
  if (!upstashConfigured()) return;
  try {
    await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/set/${key}/${encodeURIComponent(value)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );
  } catch {
    // Silent fail — in-memory cache still available
  }
}

// ── Public API ─────────────────────────────────────────────────────

export async function getToken(key: string): Promise<string | null> {
  // Layer 1: In-memory
  const cached = tokenCache.get(key);
  if (cached) return cached;

  // Layer 2: Upstash
  const persisted = await getFromUpstash(key);
  if (persisted) {
    tokenCache.set(key, persisted);
    return persisted;
  }

  // Layer 3: Environment variable
  const envKey = ENV_KEY_MAP[key];
  if (envKey && process.env[envKey]) {
    tokenCache.set(key, process.env[envKey]!);
    return process.env[envKey]!;
  }

  return null;
}

export async function setToken(key: string, value: string): Promise<void> {
  tokenCache.set(key, value);
  await setInUpstash(key, value);
}
