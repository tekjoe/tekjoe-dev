# Action Figure About Page — Design Document

## Overview

A dedicated `/about` page featuring an interactive 3D action figure box that the user can rotate. The box follows the site's VHS cassette aesthetic. The front shows a 3D figure through a clear plastic window; the back displays live stats pulled from Whoop, Strava, and GitHub.

## Routing

- New route: `/about` (`src/app/about/page.tsx`)
- Header nav "About" link changes from `#about` to `/about`
- Home page `#about` section remains as a brief teaser linking to `/about`

## 3D Scene

### Canvas Setup
- `@react-three/fiber` Canvas with `OrbitControls` from `@react-three/drei`
- Y-axis rotation (free spin), X-axis tilt (constrained to ~15deg)
- Slow auto-rotate when idle; drag/touch to interact
- Dark background matching VHS aesthetic (`#0A0A0F`)

### Box Construction
Built from planes/box geometry in Three.js:
- **Front face:** VHS-style cardboard with a transparent plastic window (clearcoat/glass material) revealing the figure inside
- **Back face:** Stats panel using `@react-three/drei`'s `<Html>` component — real HTML/CSS that tracks with the 3D surface
- **Side panels:** VHS spine styling — "TEKJOE" text, VHS color bands, year
- **Top:** Hang tab with hole (classic toy packaging detail, VHS twist)

### Figure
- Placeholder mannequin `.glb` model positioned inside the box behind the window
- Standing on a small base
- Swappable later for a real 3D scan/model

### Lighting
- Soft ambient + key directional light
- Catches plastic window reflections
- Moody VHS aesthetic — not too bright

### VHS Overlay
- Scanlines, film grain, and tracking effects consistent with hero section

## Back-of-Box Stats Panel

Layout rendered as HTML via `<Html>` from drei:

```
+------------------------------+
|  TEKJOE(TM) ACTION FIGURE   |
|  "Creative Developer Series" |
+------------------------------+
|  BIO                         |
|  8+ years building for the   |
|  web. Design + code.         |
+------------------------------+
|  DAILY STATS (Whoop)         |
|  Recovery: 82%               |
|  Strain: 14.2                |
|  Sleep: 7.8h                 |
+------------------------------+
|  ATHLETICS (Strava)          |
|  Last Run: 5.2mi - 8:15/mi  |
|  Total: 1,247 mi - 3 PRs    |
+------------------------------+
|  DEV STATS (GitHub)          |
|  Commits: 1,204              |
|  Repos: 42                   |
|  Top Lang: TypeScript        |
+------------------------------+
|  ACCESSORIES NOT INCLUDED    |
|  AGES 18+                    |
|  [VHS color band]            |
+------------------------------+
```

**Data freshness:** Fetched on page load, cached server-side for 1 hour.
**Fallback:** Last cached value with dim indicator, or "DATA UNAVAILABLE — TRACKING..." text.

## API Architecture

Three Next.js API routes:

### `GET /api/stats/github`
- Source: GitHub REST API (public, no OAuth needed)
- Returns: `{ contributions: number, repos: number, topLanguages: string[] }`
- Cache: 1 hour via `next.revalidate`

### `GET /api/stats/strava`
- Source: Strava API (OAuth 2.0, refresh token in env vars)
- Returns: `{ lastActivity: { type, distance, pace }, totalDistance: number, prCount: number }`
- Cache: 1 hour
- Auto-refreshes expired access tokens using stored refresh token

### `GET /api/stats/whoop`
- Source: Whoop API (OAuth 2.0, refresh token in env vars)
- Returns: `{ recovery: number, strain: number, sleepHours: number }`
- Cache: 1 hour
- Auto-refreshes expired access tokens using stored refresh token

All routes return: `{ data: {...}, lastUpdated: string, error?: string }`

The about page fetches all three in parallel on mount.

## Files

### Create
- `src/app/about/page.tsx` — About page with 3D canvas
- `src/components/three/action-figure-box.tsx` — Box scene component
- `src/app/api/stats/github/route.ts`
- `src/app/api/stats/strava/route.ts`
- `src/app/api/stats/whoop/route.ts`

### Modify
- `src/components/ui/header.tsx` — About link from `#about` to `/about`

## Environment Variables Required
- `GITHUB_USERNAME` — GitHub username for public API
- `STRAVA_CLIENT_ID` — Strava OAuth client ID
- `STRAVA_CLIENT_SECRET` — Strava OAuth client secret
- `STRAVA_REFRESH_TOKEN` — Strava OAuth refresh token
- `WHOOP_CLIENT_ID` — Whoop OAuth client ID
- `WHOOP_CLIENT_SECRET` — Whoop OAuth client secret
- `WHOOP_REFRESH_TOKEN` — Whoop OAuth refresh token
