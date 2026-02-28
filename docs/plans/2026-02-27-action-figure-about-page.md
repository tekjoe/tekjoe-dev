# Action Figure About Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dedicated `/about` page with a rotatable 3D action figure box (VHS-themed) whose back panel shows live stats from GitHub, Strava, and Whoop.

**Architecture:** Next.js App Router page at `/about` with a `@react-three/fiber` Canvas scene. The box is built from geometry + materials in Three.js. The back face uses `@react-three/drei`'s `<Html>` for real HTML stats. Three API routes (`/api/stats/{github,strava,whoop}`) fetch and cache external data, called in parallel on page load.

**Tech Stack:** Next.js 16, React 19, Three.js 0.182, @react-three/fiber 9, @react-three/drei 10, Tailwind CSS v4, TypeScript.

---

## Task 1: Environment Setup & Types

**Files:**
- Create: `src/types/stats.ts`
- Create: `.env.example`

**Step 1: Create shared types for all three API responses**

```ts
// src/types/stats.ts

export interface GitHubStats {
  contributions: number;
  repos: number;
  topLanguages: string[];
}

export interface StravaStats {
  lastActivity: {
    type: string;
    distance: number; // miles
    pace: string;     // e.g. "8:15/mi"
  } | null;
  totalDistance: number; // miles
  prCount: number;
}

export interface WhoopStats {
  recovery: number;    // percentage
  strain: number;      // score
  sleepHours: number;
}

export interface StatsResponse<T> {
  data: T | null;
  lastUpdated: string; // ISO timestamp
  error?: string;
}
```

**Step 2: Create `.env.example` documenting required variables**

```
# GitHub (public API — no auth needed for basic stats)
GITHUB_USERNAME=tekjoe

# Strava OAuth
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REFRESH_TOKEN=

# Whoop OAuth
WHOOP_CLIENT_ID=
WHOOP_CLIENT_SECRET=
WHOOP_REFRESH_TOKEN=
```

**Step 3: Commit**

```bash
git add src/types/stats.ts .env.example
git commit -m "feat: add stats types and env example for about page"
```

---

## Task 2: GitHub API Route

**Files:**
- Create: `src/app/api/stats/github/route.ts`

**Step 1: Implement the GitHub stats route**

This route fetches public GitHub data — no OAuth needed. It uses the GitHub REST API for user info and the GraphQL API (unauthenticated) won't work for contributions, so we'll use the events API as a proxy or the user endpoint + repos endpoint.

```ts
// src/app/api/stats/github/route.ts
import { NextResponse } from "next/server";
import type { StatsResponse, GitHubStats } from "@/types/stats";

export const revalidate = 3600; // 1 hour cache

const USERNAME = process.env.GITHUB_USERNAME || "tekjoe";

export async function GET() {
  try {
    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`,
        {
          headers: { Accept: "application/vnd.github.v3+json" },
          next: { revalidate: 3600 },
        }
      ),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      throw new Error("GitHub API request failed");
    }

    const user = await userRes.json();
    const repos = await reposRes.json();

    // Count languages across repos
    const langCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    }
    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    const data: GitHubStats = {
      contributions: user.public_repos, // public_repos as a proxy; real contribution count needs auth
      repos: user.public_repos,
      topLanguages,
    };

    const response: StatsResponse<GitHubStats> = {
      data,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: StatsResponse<GitHubStats> = {
      data: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
```

**Step 2: Test locally**

Run: `curl http://localhost:3000/api/stats/github | jq`
Expected: JSON with `data.repos`, `data.topLanguages`, `lastUpdated`

**Step 3: Commit**

```bash
git add src/app/api/stats/github/route.ts
git commit -m "feat: add GitHub stats API route"
```

---

## Task 3: Strava API Route

**Files:**
- Create: `src/app/api/stats/strava/route.ts`

**Step 1: Implement the Strava stats route with OAuth token refresh**

```ts
// src/app/api/stats/strava/route.ts
import { NextResponse } from "next/server";
import type { StatsResponse, StravaStats } from "@/types/stats";

export const revalidate = 3600;

async function getAccessToken(): Promise<string> {
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

function formatPace(metersPerSecond: number): string {
  const minutesPerMile = 1609.344 / metersPerSecond / 60;
  const mins = Math.floor(minutesPerMile);
  const secs = Math.round((minutesPerMile - mins) * 60);
  return `${mins}:${String(secs).padStart(2, "0")}/mi`;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    const [statsRes, activitiesRes] = await Promise.all([
      fetch("https://www.strava.com/api/v3/athlete", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(() =>
        fetch("https://www.strava.com/api/v3/athletes/{id}/stats".replace("{id}", "me"), {
          headers: { Authorization: `Bearer ${token}` },
        })
      ),
      fetch("https://www.strava.com/api/v3/athlete/activities?per_page=1", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    // Get athlete ID first, then stats
    const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const athlete = await athleteRes.json();

    const statsResponse = await fetch(
      `https://www.strava.com/api/v3/athletes/${athlete.id}/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const stats = await statsResponse.json();

    const activitiesResponse = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=1",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const activities = await activitiesResponse.json();

    const lastActivity = activities[0]
      ? {
          type: activities[0].type,
          distance: metersToMiles(activities[0].distance),
          pace: activities[0].average_speed
            ? formatPace(activities[0].average_speed)
            : "N/A",
        }
      : null;

    const allRunTotals = stats.all_run_totals || {};
    const allRideTotals = stats.all_ride_totals || {};
    const totalDistance = metersToMiles(
      (allRunTotals.distance || 0) + (allRideTotals.distance || 0)
    );

    const data: StravaStats = {
      lastActivity,
      totalDistance,
      prCount: stats.all_run_totals?.pr_count || 0,
    };

    const response: StatsResponse<StravaStats> = {
      data,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: StatsResponse<StravaStats> = {
      data: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
```

**Step 2: Commit** (can't test without real tokens — that's OK)

```bash
git add src/app/api/stats/strava/route.ts
git commit -m "feat: add Strava stats API route with OAuth refresh"
```

---

## Task 4: Whoop API Route

**Files:**
- Create: `src/app/api/stats/whoop/route.ts`

**Step 1: Implement the Whoop stats route with OAuth token refresh**

```ts
// src/app/api/stats/whoop/route.ts
import { NextResponse } from "next/server";
import type { StatsResponse, WhoopStats } from "@/types/stats";

export const revalidate = 3600;

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://api.prod.whoop.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.WHOOP_CLIENT_ID || "",
      client_secret: process.env.WHOOP_CLIENT_SECRET || "",
      refresh_token: process.env.WHOOP_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Whoop token refresh failed");
  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    // Fetch latest recovery and sleep cycle
    const [recoveryRes, sleepRes] = await Promise.all([
      fetch(
        "https://api.prod.whoop.com/developer/v1/recovery?limit=1&order=desc",
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        "https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1&order=desc",
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ]);

    if (!recoveryRes.ok || !sleepRes.ok) {
      throw new Error("Whoop API request failed");
    }

    const recoveryData = await recoveryRes.json();
    const sleepData = await sleepRes.json();

    const latestRecovery = recoveryData.records?.[0]?.score;
    const latestSleep = sleepData.records?.[0]?.score;

    const data: WhoopStats = {
      recovery: latestRecovery?.recovery_score ?? 0,
      strain: latestRecovery?.strain_score ?? 0,
      sleepHours: latestSleep
        ? Math.round(
            ((latestSleep.total_in_bed_time_milli || 0) / 3600000) * 10
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
```

**Step 2: Commit**

```bash
git add src/app/api/stats/whoop/route.ts
git commit -m "feat: add Whoop stats API route with OAuth refresh"
```

---

## Task 5: Stats Fetching Hook

**Files:**
- Create: `src/hooks/use-stats.ts`

**Step 1: Create a client-side hook that fetches all three APIs in parallel**

```ts
// src/hooks/use-stats.ts
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
```

**Step 2: Commit**

```bash
git add src/hooks/use-stats.ts
git commit -m "feat: add useStats hook for parallel API fetching"
```

---

## Task 6: Back-of-Box Stats Panel Component

**Files:**
- Create: `src/components/three/stats-panel.tsx`

**Step 1: Create the HTML panel that will be rendered via drei's `<Html>`**

This is a styled HTML component — not 3D geometry. It renders inside the Three.js scene using `@react-three/drei`'s `<Html>` which creates a DOM overlay that tracks a 3D position.

```tsx
// src/components/three/stats-panel.tsx
"use client";

import type { AllStats } from "@/hooks/use-stats";

interface StatsPanelProps {
  stats: AllStats;
  loading: boolean;
}

function StatValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </span>
      <span className="font-mono text-sm text-white tabular-nums">{value}</span>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-white/10 pb-1 mb-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-vhs-yellow">
        {children}
      </span>
    </div>
  );
}

function Unavailable() {
  return (
    <p className="font-mono text-[10px] text-white/30 italic">
      DATA UNAVAILABLE — TRACKING...
    </p>
  );
}

export function StatsPanel({ stats, loading }: StatsPanelProps) {
  const { github, strava, whoop } = stats;

  return (
    <div
      className="w-[280px] p-4 text-white"
      style={{
        background: "linear-gradient(180deg, #1a1820 0%, #0e0d12 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-3 pb-2 border-b border-white/10">
        <p className="font-display text-base font-bold tracking-wide">
          TEKJOE&trade;
        </p>
        <p className="text-[9px] text-white/40 tracking-widest uppercase">
          Creative Developer Series
        </p>
      </div>

      {/* Bio */}
      <div className="mb-3">
        <SectionHeader>Bio</SectionHeader>
        <p className="text-[11px] text-white/70 leading-relaxed">
          8+ years building for the web. Design + code. Crafting interfaces that
          feel as good as they look.
        </p>
      </div>

      {/* Whoop */}
      <div className="mb-3">
        <SectionHeader>Daily Stats</SectionHeader>
        {whoop.data ? (
          <div className="space-y-1">
            <StatValue label="Recovery" value={`${whoop.data.recovery}%`} />
            <StatValue label="Strain" value={`${whoop.data.strain}`} />
            <StatValue label="Sleep" value={`${whoop.data.sleepHours}h`} />
          </div>
        ) : (
          <Unavailable />
        )}
      </div>

      {/* Strava */}
      <div className="mb-3">
        <SectionHeader>Athletics</SectionHeader>
        {strava.data ? (
          <div className="space-y-1">
            {strava.data.lastActivity && (
              <StatValue
                label="Last Run"
                value={`${strava.data.lastActivity.distance}mi · ${strava.data.lastActivity.pace}`}
              />
            )}
            <StatValue
              label="Total"
              value={`${strava.data.totalDistance.toLocaleString()} mi`}
            />
            <StatValue label="PRs" value={`${strava.data.prCount}`} />
          </div>
        ) : (
          <Unavailable />
        )}
      </div>

      {/* GitHub */}
      <div className="mb-3">
        <SectionHeader>Dev Stats</SectionHeader>
        {github.data ? (
          <div className="space-y-1">
            <StatValue label="Repos" value={`${github.data.repos}`} />
            <StatValue
              label="Top Lang"
              value={github.data.topLanguages[0] || "N/A"}
            />
          </div>
        ) : (
          <Unavailable />
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10 text-center">
        <p className="text-[8px] text-white/30 uppercase tracking-widest">
          Accessories not included · Ages 18+
        </p>
        <div
          className="mt-2 h-[3px] w-full"
          style={{
            background:
              "linear-gradient(90deg, #E72026, #F85716, #FED801, #B3C53B, #10BBE4, #46157B, #E8258F, #E72026)",
          }}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="font-mono text-[10px] text-vhs-yellow animate-pulse">
            LOADING STATS...
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/three/stats-panel.tsx
git commit -m "feat: add back-of-box stats panel component"
```

---

## Task 7: 3D Action Figure Box Scene

**Files:**
- Create: `src/components/three/action-figure-box.tsx`

**Step 1: Build the 3D box scene**

This is the main scene component. It creates the VHS-style box from geometry, places a placeholder figure inside, and mounts the `<Html>` stats panel on the back face.

```tsx
// src/components/three/action-figure-box.tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { StatsPanel } from "./stats-panel";
import type { AllStats } from "@/hooks/use-stats";

// Box dimensions (action figure box proportions)
const BOX_W = 2.4;
const BOX_H = 3.6;
const BOX_D = 1.0;

/* ─── Box Face ─── */
function BoxFace({
  position,
  rotation,
  size,
  color,
  opacity = 1,
  metalness = 0,
  roughness = 0.8,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  color: string;
  opacity?: number;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        metalness={metalness}
        roughness={roughness}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─── Clear plastic window on front ─── */
function PlasticWindow() {
  const windowW = BOX_W * 0.7;
  const windowH = BOX_H * 0.5;
  return (
    <mesh position={[0, 0.2, BOX_D / 2 + 0.001]}>
      <planeGeometry args={[windowW, windowH]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.12}
        metalness={0.1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.02}
        envMapIntensity={1.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─── Placeholder figure (simple mannequin) ─── */
function PlaceholderFigure() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#8a8580" roughness={0.6} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
        <meshStandardMaterial color="#6e6a66" roughness={0.7} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.35, 0.8, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshStandardMaterial color="#7a7672" roughness={0.7} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.35, 0.8, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshStandardMaterial color="#7a7672" roughness={0.7} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.15, 0.1, 0]}>
        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        <meshStandardMaterial color="#5e5a56" roughness={0.7} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.15, 0.1, 0]}>
        <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
        <meshStandardMaterial color="#5e5a56" roughness={0.7} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── VHS Color Band strip ─── */
function ColorBand({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial>
        <canvasTexture
          attach="map"
          image={(() => {
            const canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 8;
            const ctx = canvas.getContext("2d")!;
            const gradient = ctx.createLinearGradient(0, 0, 256, 0);
            gradient.addColorStop(0, "#E72026");
            gradient.addColorStop(0.14, "#F85716");
            gradient.addColorStop(0.28, "#FED801");
            gradient.addColorStop(0.42, "#B3C53B");
            gradient.addColorStop(0.57, "#10BBE4");
            gradient.addColorStop(0.71, "#46157B");
            gradient.addColorStop(0.85, "#E8258F");
            gradient.addColorStop(1, "#E72026");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 8);
            return canvas;
          })()}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

/* ─── The complete box ─── */
function ActionFigureBoxModel({
  stats,
  loading,
}: {
  stats: AllStats;
  loading: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow idle rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    // Only auto-rotate if OrbitControls isn't being used
    // OrbitControls handles this via autoRotate prop instead
  });

  const cardboardColor = "#2a2226";
  const sideColor = "#1e1a1f";

  return (
    <group ref={groupRef}>
      {/* Front face (cardboard backing) */}
      <BoxFace
        position={[0, 0, BOX_D / 2]}
        size={[BOX_W, BOX_H]}
        color={cardboardColor}
      />

      {/* Plastic window on front */}
      <PlasticWindow />

      {/* Back face */}
      <BoxFace
        position={[0, 0, -BOX_D / 2]}
        rotation={[0, Math.PI, 0]}
        size={[BOX_W, BOX_H]}
        color={cardboardColor}
      />

      {/* Back face — HTML stats panel */}
      <Html
        position={[0, 0, -BOX_D / 2 - 0.01]}
        rotation={[0, Math.PI, 0]}
        transform
        occlude
        distanceFactor={4}
      >
        <StatsPanel stats={stats} loading={loading} />
      </Html>

      {/* Left side */}
      <BoxFace
        position={[-BOX_W / 2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[BOX_D, BOX_H]}
        color={sideColor}
      />

      {/* Right side */}
      <BoxFace
        position={[BOX_W / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[BOX_D, BOX_H]}
        color={sideColor}
      />

      {/* Top */}
      <BoxFace
        position={[0, BOX_H / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[BOX_W, BOX_D]}
        color={sideColor}
      />

      {/* Bottom */}
      <BoxFace
        position={[0, -BOX_H / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        size={[BOX_W, BOX_D]}
        color={sideColor}
      />

      {/* Color band on front — bottom */}
      <ColorBand
        position={[0, -BOX_H / 2 + 0.2, BOX_D / 2 + 0.002]}
        size={[BOX_W * 0.9, 0.06]}
      />

      {/* Placeholder figure inside */}
      <PlaceholderFigure />
    </group>
  );
}

/* ─── Exported scene with Canvas ─── */
export function ActionFigureScene({
  stats,
  loading,
}: {
  stats: AllStats;
  loading: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#4488cc" />

      <ActionFigureBoxModel stats={stats} loading={loading} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
        minPolarAngle={Math.PI / 2 - 0.3}
        maxPolarAngle={Math.PI / 2 + 0.3}
      />

      <Environment preset="city" />
    </Canvas>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx next build 2>&1 | tail -5`
Expected: `Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/three/action-figure-box.tsx
git commit -m "feat: add 3D action figure box scene"
```

---

## Task 8: About Page

**Files:**
- Create: `src/app/about/page.tsx`

**Step 1: Create the about page**

```tsx
// src/app/about/page.tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useStats } from "@/hooks/use-stats";

const ActionFigureScene = dynamic(
  () =>
    import("@/components/three/action-figure-box").then(
      (mod) => mod.ActionFigureScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <p className="font-mono text-xs text-vhs-yellow animate-pulse">
          LOADING...
        </p>
      </div>
    ),
  }
);

export default function AboutPage() {
  const { stats, loading } = useStats();

  return (
    <main className="min-h-screen bg-vhs-bg pt-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-vhs-yellow mb-2">
            About
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Meet the Developer
          </h1>
          <p className="text-white/50 text-sm mt-3 max-w-md mx-auto">
            Drag to rotate. Flip it around to see the stats.
          </p>
        </div>

        {/* 3D Scene */}
        <div className="w-full aspect-square max-w-2xl mx-auto">
          <ActionFigureScene stats={stats} loading={loading} />
        </div>

        {/* Back link */}
        <div className="text-center mt-12 pb-16">
          <Link
            href="/"
            className="font-mono text-xs text-vhs-gray hover:text-vhs-yellow transition-colors uppercase tracking-widest"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
```

**Step 2: Verify the page loads**

Run: `npx next build 2>&1 | tail -10`
Expected: Route `/about` appears in the output, no errors.

**Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add /about page with action figure box"
```

---

## Task 9: Update Header Navigation

**Files:**
- Modify: `src/components/ui/header.tsx`

**Step 1: Change the About link from hash to route**

In `src/components/ui/header.tsx`, find the `navLinks` array and change the About entry:

```ts
// Before:
{ href: "#about", label: "About" },

// After:
{ href: "/about", label: "About" },
```

**Step 2: Verify navigation works**

Run the dev server: `npm run dev`
Click the About link in the header — should navigate to `/about`.

**Step 3: Commit**

```bash
git add src/components/ui/header.tsx
git commit -m "feat: update About nav link to /about route"
```

---

## Task 10: VHS Overlay on About Page

**Files:**
- Modify: `src/app/about/page.tsx`

**Step 1: Add scanlines and film grain to the about page**

Import `HeroShaders` (which is now a CSS-only component) and add it as an overlay:

Add to the `<main>` tag in `about/page.tsx`:

```tsx
import { HeroShaders } from "@/components/shaders/hero-shaders";

// Inside the return, after the main closing div but before </main>:
<div className="fixed inset-0 pointer-events-none z-50">
  <HeroShaders />
</div>
<div className="fixed inset-0 scanline-overlay pointer-events-none opacity-[0.06] z-50" />
```

**Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add VHS overlay effects to about page"
```

---

## Task 11: Final Build Verification

**Step 1: Run a full build**

Run: `npx next build 2>&1 | tail -20`
Expected: All routes compile, no errors.

**Step 2: Manual QA checklist**

- [ ] `/about` loads without console errors
- [ ] 3D box renders and is rotatable
- [ ] Auto-rotation works when idle
- [ ] Dragging overrides auto-rotation
- [ ] Back face shows stats panel (with fallback text if no API tokens)
- [ ] Plastic window has subtle reflections
- [ ] VHS scanlines/grain visible
- [ ] Header "About" link navigates to `/about`
- [ ] "Back to Home" link works
- [ ] Mobile: touch-drag rotates the box
- [ ] No hydration mismatches

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete action figure about page"
```
