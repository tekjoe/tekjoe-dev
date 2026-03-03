# VHS Tape Carousel — About Page Redesign

## Overview

Replace the current single action-figure-box on the about page with a 3D carousel of 4 VHS tapes. Each tape has unique front branding and back-cover content displaying different data (Bio, GitHub, Strava, Whoop). SEO is preserved via crawlable HTML sections below the carousel.

## Tapes

| Tape | Front Label | Accent Color | Back Content | Format Badge |
|------|------------|-------------|-------------|-------------|
| Bio | JOE RAMIREZ / Creative Developer | #FED801 (yellow) | Name, bio, experience, links | T-120 |
| GitHub | DEV STATS / Open Source | #46157B (purple) | Repos, languages, contributions | EP-120 |
| Strava | ATHLETICS / Training Log | #F85716 (orange) | Distance, rides, YTD | SP-90 |
| Whoop | RECOVERY / Daily Metrics | #10BBE4 (cyan) | Recovery, strain, sleep | LP-180 |

Each tape shares the same 3D shell geometry (RoundedBox, upright VHS case proportions: 2.4w x 3.6h x 0.5d). Front labels and back panels rendered via R3F `<Html>`. Spines show vertical title text for identification in the arc.

## Scene Layout

Single R3F `<Canvas>` renders all 4 tapes. Camera is fixed (no OrbitControls).

- **Selected tape:** Position [0, 0, 2], auto-rotates slowly around Y axis
- **Non-selected tapes:** Fanned in a semicircle at z=0, ~45 degrees apart, scaled to ~70%, slightly dimmed
- **Transitions:** useFrame lerp (~0.05) for smooth 60fps position/rotation animation
- **Interaction:** R3F `onClick` on each tape mesh + DOM tab bar below canvas
- **Hover:** Non-selected tapes scale 1.0 to 1.05, cursor: pointer
- **Mobile:** Tapes scaled down, camera pulled back. Tab bar is primary navigation.

## Navigation

Dual navigation for accessibility:
1. Click/tap directly on 3D tapes in the scene
2. Labeled tab bar below the canvas (Bio, GitHub, Strava, Whoop)

Both stay in sync via shared `selectedTape` state.

## Back Cover Panels

All panels share a common layout: dark background, accent color header band, content rows in mono font. 280x420px via `<Html>`.

**Bio:** Name, title, location, bio paragraph, years/projects stats, GitHub/LinkedIn links, availability badge.

**GitHub:** Total repos, top 3 languages with color dots, contribution count, recent repo. Data from `/api/stats/github`.

**Strava:** Total distance (miles), YTD distance, recent ride count. Data from `/api/stats/strava`.

**Whoop:** Recovery score (color-coded), strain, sleep hours. Data from `/api/stats/whoop`.

Loading state: "TRACKING..." placeholder (existing pattern).

## SEO Strategy

Page is a **server component** at the top level. 3D carousel is a client component dynamically imported with `ssr: false`.

Below the carousel, plain HTML sections render the same content:
- Bio Section (h2, paragraph, stats)
- Dev Stats Section (h2, GitHub data)
- Athletics Section (h2, Strava data)
- Recovery Section (h2, Whoop data)

These sections are server-rendered, fully crawlable, styled to match VHS aesthetic. Stats fetched server-side and passed as props to both carousel and HTML sections.

Page exports `metadata` with title, description, and Open Graph tags.

## Architecture

**Approach:** Single Canvas, Multi-Mesh. One WebGL context, shared lighting, all tapes as meshes in one scene. Best performance and smoothest transitions.

### New Files

- `src/components/three/vhs-carousel.tsx` — Canvas scene with 4 tapes, arc positioning, selection state, lerped transitions
- `src/components/three/vhs-tape-box.tsx` — Reusable single tape mesh. Props: label, backContent, accentColor, isSelected, position, onClick
- `src/components/three/tape-labels/bio-label.tsx`
- `src/components/three/tape-labels/github-label.tsx`
- `src/components/three/tape-labels/strava-label.tsx`
- `src/components/three/tape-labels/whoop-label.tsx`
- `src/components/three/tape-backs/bio-back.tsx`
- `src/components/three/tape-backs/github-back.tsx`
- `src/components/three/tape-backs/strava-back.tsx`
- `src/components/three/tape-backs/whoop-back.tsx`
- `src/components/about/carousel-tabs.tsx` — Tab bar (DOM)
- `src/components/about/about-sections.tsx` — Crawlable HTML sections

### Modified Files

- `src/app/about/page.tsx` — Server component with metadata, server-side stats fetch, renders carousel + HTML sections

### Kept As-Is

- `src/components/three/action-figure-box.tsx` — Not deleted, new component extracted from it

### Data Flow

```
page.tsx (server)
  |-- fetches stats from /api/stats/* at request time
  |-- passes stats as props to:
  |     |-- VHSCarousel (client) -> renders 4 tape meshes in Canvas
  |     |-- AboutSections (server) -> renders crawlable HTML
  |-- exports metadata for SEO
```

### State

- `selectedTape: number` (0-3) via useState, local to carousel client component
- Shared between Canvas scene and tab bar via props/callbacks
- No global state needed
