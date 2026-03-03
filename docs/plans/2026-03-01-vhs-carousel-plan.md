# VHS Tape Carousel — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single action-figure-box on `/about` with a 3D carousel of 4 VHS tapes (Bio, GitHub, Strava, Whoop), each with unique front labels and back-cover stats, plus crawlable HTML sections for SEO.

**Architecture:** Single R3F Canvas with 4 tape meshes positioned in an arc. Selected tape auto-rotates at center; non-selected fan out behind at 70% scale. Page is a server component that fetches stats and passes them to both the client carousel and server-rendered HTML sections.

**Tech Stack:** React Three Fiber, @react-three/drei (Html), Next.js App Router (server components, metadata), Framer Motion (tab bar), Tailwind CSS.

**Design doc:** `docs/plans/2026-03-01-vhs-carousel-design.md`

---

## Task 1: Create VHSTapeBox Component

Reusable single-tape mesh extracted from the `action-figure-box.tsx` pattern. Renders 6 box faces with front label, back content, and spine label as React node slots via `<Html>`.

**Files:**
- Create: `src/components/three/vhs-tape-box.tsx`

**Reference:** `src/components/three/action-figure-box.tsx` — reuses BoxFace pattern and face-visibility dot-product check from VHSTapeModel.

### Step 1: Create vhs-tape-box.tsx

```tsx
// src/components/three/vhs-tape-box.tsx
"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const BOX_W = 2.4;
const BOX_H = 3.6;
const BOX_D = 0.5;

function BoxFace({
  position,
  rotation,
  size,
  color,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

interface VHSTapeBoxProps {
  frontLabel: React.ReactNode;
  backContent: React.ReactNode;
  spineTitle: string;
  accentColor: string;
  isSelected: boolean;
  onClick: () => void;
}

export function VHSTapeBox({
  frontLabel,
  backContent,
  spineTitle,
  accentColor,
  isSelected,
  onClick,
}: VHSTapeBoxProps) {
  const faceColor = "#2d2830";
  const sideColor = "#231f28";
  const groupRef = useRef<THREE.Group>(null);
  const [backFaceVisible, setBackFaceVisible] = useState(false);
  const [frontFaceVisible, setFrontFaceVisible] = useState(true);
  const [rightFaceVisible, setRightFaceVisible] = useState(false);

  const backNormal = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  const frontNormal = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const rightNormal = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const worldNormal = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(worldPos);
    camDir.copy(camera.position).sub(worldPos).normalize();

    worldNormal.copy(backNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    setBackFaceVisible(worldNormal.dot(camDir) > 0.15);

    worldNormal.copy(frontNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    setFrontFaceVisible(worldNormal.dot(camDir) > 0.15);

    worldNormal.copy(rightNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    setRightFaceVisible(worldNormal.dot(camDir) > 0.15);
  });

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Front face */}
      <BoxFace position={[0, 0, BOX_D / 2]} size={[BOX_W, BOX_H]} color={faceColor} />
      {frontFaceVisible && (
        <Html
          position={[0, 0, BOX_D / 2 + 0.01]}
          transform
          distanceFactor={3.4}
          zIndexRange={[1, 0]}
          center
        >
          {frontLabel}
        </Html>
      )}

      {/* Back face */}
      <BoxFace position={[0, 0, -BOX_D / 2]} rotation={[0, Math.PI, 0]} size={[BOX_W, BOX_H]} color={faceColor} />
      {backFaceVisible && (
        <Html
          position={[0, 0, -BOX_D / 2 - 0.01]}
          rotation={[0, Math.PI, 0]}
          transform
          distanceFactor={3.4}
          zIndexRange={[1, 0]}
          center
        >
          {backContent}
        </Html>
      )}

      {/* Sides */}
      <BoxFace position={[-BOX_W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} size={[BOX_D, BOX_H]} color="#efefef" />
      <BoxFace position={[BOX_W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} size={[BOX_D, BOX_H]} color={sideColor} />
      <BoxFace position={[0, BOX_H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} size={[BOX_W, BOX_D]} color={sideColor} />
      <BoxFace position={[0, -BOX_H / 2, 0]} rotation={[Math.PI / 2, 0, 0]} size={[BOX_W, BOX_D]} color={sideColor} />

      {/* Spine label on right face */}
      {rightFaceVisible && (
        <Html
          position={[BOX_W / 2 + 0.01, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          transform
          distanceFactor={3.4}
          zIndexRange={[1, 0]}
          center
        >
          <SpineLabel title={spineTitle} accentColor={accentColor} />
        </Html>
      )}
    </group>
  );
}

function SpineLabel({ title, accentColor }: { title: string; accentColor: string }) {
  return (
    <div
      className="relative select-none overflow-hidden"
      style={{
        width: "60px",
        height: "420px",
        background: "#1a1a1a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Accent stripe */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "4px", background: accentColor }}
      />

      {/* Vertical title */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: accentColor }}
        >
          {title}
        </span>
      </div>

      {/* Bottom VHS badge */}
      <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2">
        <span className="text-[6px] font-semibold text-white/30 uppercase tracking-widest">
          VHS
        </span>
      </div>
    </div>
  );
}
```

### Step 2: Verify it compiles

Run: `npx tsc --noEmit`
Expected: No errors related to vhs-tape-box.tsx

### Step 3: Commit

```bash
git add src/components/three/vhs-tape-box.tsx
git commit -m "feat(about): add reusable VHSTapeBox 3D component"
```

---

## Task 2: Create Front Label Components

Four unique front label components, one per tape. Each shares the same 280x420px layout but with unique text, accent color, and format badge.

**Files:**
- Create: `src/components/three/tape-labels/bio-label.tsx`
- Create: `src/components/three/tape-labels/github-label.tsx`
- Create: `src/components/three/tape-labels/strava-label.tsx`
- Create: `src/components/three/tape-labels/whoop-label.tsx`

**Reference:** `src/components/three/action-figure-box.tsx` lines 35-90 (FrontLabel).

All labels share this structure:
- Black top bar with format badge (T-120, EP-120, SP-90, LP-180)
- Color bands using the tape's accent color + complementary bands
- Light gray lower section with title text
- VHS logo badge bottom-left

### Step 1: Create bio-label.tsx

```tsx
// src/components/three/tape-labels/bio-label.tsx
export function BioLabel() {
  return (
    <div
      className="w-[280px] h-[420px] relative select-none overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* Black top with format badge */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: "140px", background: "#000000" }}
      >
        <span className="text-[80px] font-black text-white tracking-tight leading-none">
          T-120
        </span>
      </div>

      {/* Color bands — yellow dominant */}
      <div className="absolute left-0 right-0" style={{ top: "140px" }}>
        <div style={{ height: "22px", background: "#FED801" }} />
        <div style={{ height: "26px", background: "#E8258F" }} />
        <div style={{ height: "22px", background: "#eb2635" }} />
        <div style={{ height: "26px", background: "#fd8010" }} />
      </div>

      {/* Light gray lower */}
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-start justify-center px-5"
        style={{ top: "236px", background: "#efefef" }}
      >
        <span className="text-[22px] font-black text-black leading-tight tracking-tight">
          JOE RAMIREZ
        </span>
        <span className="text-[11px] font-bold text-black/50 uppercase tracking-[0.2em] mt-1">
          Creative Developer
        </span>
      </div>

      {/* Arrow tab */}
      <svg
        className="absolute"
        style={{ right: "0", top: "250px" }}
        width="60"
        height="100"
        viewBox="0 0 60 100"
      >
        <polygon points="60,0 0,50 60,100" fill="#3f3f3f" />
      </svg>

      {/* VHS logo */}
      <div
        className="absolute bottom-[14px] left-[10px] bg-white px-[6px] py-[3px]"
        style={{ border: "2px solid black" }}
      >
        <span
          className="text-[14px] font-semibold text-black"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          VHS
        </span>
      </div>
    </div>
  );
}
```

### Step 2: Create github-label.tsx

```tsx
// src/components/three/tape-labels/github-label.tsx
export function GitHubLabel() {
  return (
    <div
      className="w-[280px] h-[420px] relative select-none overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: "140px", background: "#000000" }}
      >
        <span className="text-[80px] font-black text-white tracking-tight leading-none">
          EP-120
        </span>
      </div>

      <div className="absolute left-0 right-0" style={{ top: "140px" }}>
        <div style={{ height: "22px", background: "#46157B" }} />
        <div style={{ height: "26px", background: "#6B3FA0" }} />
        <div style={{ height: "22px", background: "#8B5CF6" }} />
        <div style={{ height: "26px", background: "#46157B" }} />
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-start justify-center px-5"
        style={{ top: "236px", background: "#efefef" }}
      >
        <span className="text-[22px] font-black text-black leading-tight tracking-tight">
          DEV STATS
        </span>
        <span className="text-[11px] font-bold text-black/50 uppercase tracking-[0.2em] mt-1">
          Open Source
        </span>
      </div>

      <svg
        className="absolute"
        style={{ right: "0", top: "250px" }}
        width="60"
        height="100"
        viewBox="0 0 60 100"
      >
        <polygon points="60,0 0,50 60,100" fill="#3f3f3f" />
      </svg>

      <div
        className="absolute bottom-[14px] left-[10px] bg-white px-[6px] py-[3px]"
        style={{ border: "2px solid black" }}
      >
        <span
          className="text-[14px] font-semibold text-black"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          VHS
        </span>
      </div>
    </div>
  );
}
```

### Step 3: Create strava-label.tsx

```tsx
// src/components/three/tape-labels/strava-label.tsx
export function StravaLabel() {
  return (
    <div
      className="w-[280px] h-[420px] relative select-none overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: "140px", background: "#000000" }}
      >
        <span className="text-[80px] font-black text-white tracking-tight leading-none">
          SP-90
        </span>
      </div>

      <div className="absolute left-0 right-0" style={{ top: "140px" }}>
        <div style={{ height: "22px", background: "#F85716" }} />
        <div style={{ height: "26px", background: "#FF7A3D" }} />
        <div style={{ height: "22px", background: "#FED801" }} />
        <div style={{ height: "26px", background: "#F85716" }} />
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-start justify-center px-5"
        style={{ top: "236px", background: "#efefef" }}
      >
        <span className="text-[22px] font-black text-black leading-tight tracking-tight">
          ATHLETICS
        </span>
        <span className="text-[11px] font-bold text-black/50 uppercase tracking-[0.2em] mt-1">
          Training Log
        </span>
      </div>

      <svg
        className="absolute"
        style={{ right: "0", top: "250px" }}
        width="60"
        height="100"
        viewBox="0 0 60 100"
      >
        <polygon points="60,0 0,50 60,100" fill="#3f3f3f" />
      </svg>

      <div
        className="absolute bottom-[14px] left-[10px] bg-white px-[6px] py-[3px]"
        style={{ border: "2px solid black" }}
      >
        <span
          className="text-[14px] font-semibold text-black"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          VHS
        </span>
      </div>
    </div>
  );
}
```

### Step 4: Create whoop-label.tsx

```tsx
// src/components/three/tape-labels/whoop-label.tsx
export function WhoopLabel() {
  return (
    <div
      className="w-[280px] h-[420px] relative select-none overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: "140px", background: "#000000" }}
      >
        <span className="text-[80px] font-black text-white tracking-tight leading-none">
          LP-180
        </span>
      </div>

      <div className="absolute left-0 right-0" style={{ top: "140px" }}>
        <div style={{ height: "22px", background: "#10BBE4" }} />
        <div style={{ height: "26px", background: "#0E8DB8" }} />
        <div style={{ height: "22px", background: "#46157B" }} />
        <div style={{ height: "26px", background: "#10BBE4" }} />
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-start justify-center px-5"
        style={{ top: "236px", background: "#efefef" }}
      >
        <span className="text-[22px] font-black text-black leading-tight tracking-tight">
          RECOVERY
        </span>
        <span className="text-[11px] font-bold text-black/50 uppercase tracking-[0.2em] mt-1">
          Daily Metrics
        </span>
      </div>

      <svg
        className="absolute"
        style={{ right: "0", top: "250px" }}
        width="60"
        height="100"
        viewBox="0 0 60 100"
      >
        <polygon points="60,0 0,50 60,100" fill="#3f3f3f" />
      </svg>

      <div
        className="absolute bottom-[14px] left-[10px] bg-white px-[6px] py-[3px]"
        style={{ border: "2px solid black" }}
      >
        <span
          className="text-[14px] font-semibold text-black"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          VHS
        </span>
      </div>
    </div>
  );
}
```

### Step 5: Verify

Run: `npx tsc --noEmit`
Expected: No errors

### Step 6: Commit

```bash
git add src/components/three/tape-labels/
git commit -m "feat(about): add 4 unique VHS front label components"
```

---

## Task 3: Create Back Panel Components

Four back-cover content panels, one per tape. All share the same 280x420px dark layout with an accent-colored header band and mono-font content rows.

**Files:**
- Create: `src/components/three/tape-backs/bio-back.tsx`
- Create: `src/components/three/tape-backs/github-back.tsx`
- Create: `src/components/three/tape-backs/strava-back.tsx`
- Create: `src/components/three/tape-backs/whoop-back.tsx`

**Reference:** `src/components/three/stats-panel.tsx` — reuses StatValue and SectionHeader patterns.

**Shared types:** Each back component that shows live data accepts the relevant stats type + loading boolean. Bio is static content only.

### Step 1: Create bio-back.tsx

Static content — no data props needed.

```tsx
// src/components/three/tape-backs/bio-back.tsx
export function BioBack() {
  return (
    <div
      className="w-[280px] h-[420px] text-white relative flex flex-col overflow-hidden select-none"
      style={{
        background: "#1a1a1a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Accent header */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: "40px", background: "#FED801" }}
      >
        <span className="text-[18px] font-black text-black tracking-tight leading-none">
          BIO
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        <div className="mb-3">
          <p className="text-[16px] font-bold text-white leading-tight">
            Joe Ramirez
          </p>
          <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mt-0.5">
            Creative Developer
          </p>
          <p className="text-[9px] text-white/40 mt-0.5">Milwaukee, WI</p>
        </div>

        <p className="text-[9px] text-white/60 leading-relaxed mb-3">
          8+ years building for the web. Crafting interfaces that feel as good as
          they look — shader-rich, bold geometry, handcrafted motion.
        </p>

        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between items-baseline">
            <span className="text-[8px] uppercase tracking-widest text-white/40">
              Experience
            </span>
            <span className="font-mono text-[10px] text-white/80">8+ years</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[8px] uppercase tracking-widest text-white/40">
              Projects
            </span>
            <span className="font-mono text-[10px] text-white/80">50+</span>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <a
            href="https://github.com/tekjoe"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[8px] tracking-wider text-[#FED801] hover:underline"
          >
            github.com/tekjoe
          </a>
          <a
            href="https://linkedin.com/in/tekjoe"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[8px] tracking-wider text-[#FED801] hover:underline"
          >
            linkedin.com/in/tekjoe
          </a>
        </div>

        <div className="mt-auto pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] text-white/50 uppercase tracking-widest">
              Available for projects
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Create github-back.tsx

```tsx
// src/components/three/tape-backs/github-back.tsx
import type { StatsResponse, GitHubStats } from "@/types/stats";

interface GitHubBackProps {
  github: StatsResponse<GitHubStats>;
  loading: boolean;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Ruby: "#701516",
};

export function GitHubBack({ github, loading }: GitHubBackProps) {
  return (
    <div
      className="w-[280px] h-[420px] text-white relative flex flex-col overflow-hidden select-none"
      style={{
        background: "#1a1a1a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: "40px", background: "#46157B" }}
      >
        <span className="text-[18px] font-black text-white tracking-tight leading-none">
          DEV STATS
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        {github.data ? (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[8px] uppercase tracking-widest text-white/40">
                  Repos
                </span>
                <span className="font-mono text-[10px] text-white/80">
                  {github.data.repos}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[8px] uppercase tracking-widest text-white/40">
                  Contributions
                </span>
                <span className="font-mono text-[10px] text-white/80">
                  {github.data.contributions}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-[8px] uppercase tracking-widest text-white/40 block mb-2">
                Top Languages
              </span>
              <div className="space-y-1.5">
                {github.data.topLanguages.slice(0, 3).map((lang) => (
                  <div key={lang} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: LANG_COLORS[lang] || "#888" }}
                    />
                    <span className="font-mono text-[9px] text-white/70">
                      {lang}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-[10px] text-[#46157B] animate-pulse">
              TRACKING...
            </p>
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-white/10 text-center">
          <p className="text-[7px] text-white/30 uppercase tracking-widest">
            Extended Play &middot; EP-120
          </p>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="font-mono text-[10px] text-[#46157B] animate-pulse">
            LOADING STATS...
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create strava-back.tsx

```tsx
// src/components/three/tape-backs/strava-back.tsx
import type { StatsResponse, StravaStats } from "@/types/stats";

interface StravaBackProps {
  strava: StatsResponse<StravaStats>;
  loading: boolean;
}

export function StravaBack({ strava, loading }: StravaBackProps) {
  return (
    <div
      className="w-[280px] h-[420px] text-white relative flex flex-col overflow-hidden select-none"
      style={{
        background: "#1a1a1a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: "40px", background: "#F85716" }}
      >
        <span className="text-[18px] font-black text-white tracking-tight leading-none">
          ATHLETICS
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        {strava.data ? (
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] uppercase tracking-widest text-white/40">
                Total Distance
              </span>
              <span className="font-mono text-[10px] text-white/80">
                {strava.data.totalDistance.toLocaleString()} mi
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] uppercase tracking-widest text-white/40">
                YTD Distance
              </span>
              <span className="font-mono text-[10px] text-white/80">
                {strava.data.ytdDistance.toLocaleString()} mi
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] uppercase tracking-widest text-white/40">
                Recent Rides
              </span>
              <span className="font-mono text-[10px] text-white/80">
                {strava.data.recentRideCount}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-[10px] text-[#F85716] animate-pulse">
              TRACKING...
            </p>
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-white/10 text-center">
          <p className="text-[7px] text-white/30 uppercase tracking-widest">
            Standard Play &middot; SP-90
          </p>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="font-mono text-[10px] text-[#F85716] animate-pulse">
            LOADING STATS...
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Create whoop-back.tsx

```tsx
// src/components/three/tape-backs/whoop-back.tsx
import type { StatsResponse, WhoopStats } from "@/types/stats";

interface WhoopBackProps {
  whoop: StatsResponse<WhoopStats>;
  loading: boolean;
}

function recoveryColor(score: number): string {
  if (score >= 67) return "#00D46A";
  if (score >= 34) return "#FED801";
  return "#E72026";
}

export function WhoopBack({ whoop, loading }: WhoopBackProps) {
  return (
    <div
      className="w-[280px] h-[420px] text-white relative flex flex-col overflow-hidden select-none"
      style={{
        background: "#1a1a1a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: "40px", background: "#10BBE4" }}
      >
        <span className="text-[18px] font-black text-white tracking-tight leading-none">
          RECOVERY
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        {whoop.data ? (
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] uppercase tracking-widest text-white/40">
                Recovery
              </span>
              <span
                className="font-mono text-[10px] font-bold"
                style={{ color: recoveryColor(whoop.data.recovery) }}
              >
                {whoop.data.recovery}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] uppercase tracking-widest text-white/40">
                Strain
              </span>
              <span className="font-mono text-[10px] text-white/80">
                {whoop.data.strain}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] uppercase tracking-widest text-white/40">
                Sleep
              </span>
              <span className="font-mono text-[10px] text-white/80">
                {whoop.data.sleepHours}h
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-[10px] text-[#10BBE4] animate-pulse">
              TRACKING...
            </p>
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-white/10 text-center">
          <p className="text-[7px] text-white/30 uppercase tracking-widest">
            Long Play &middot; LP-180
          </p>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="font-mono text-[10px] text-[#10BBE4] animate-pulse">
            LOADING STATS...
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Verify

Run: `npx tsc --noEmit`
Expected: No errors

### Step 6: Commit

```bash
git add src/components/three/tape-backs/
git commit -m "feat(about): add 4 back panel components for VHS tapes"
```

---

## Task 4: Create VHSCarousel Scene Component

The main Canvas scene that renders all 4 tapes, handles arc positioning, selection, lerped transitions, and auto-rotation of the selected tape.

**Files:**
- Create: `src/components/three/vhs-carousel.tsx`

**Key behaviors:**
- Selected tape: position `[0, 0, 2]`, auto-rotates Y, scale 1.0
- Non-selected: fanned in arc at `z=-1`, ~45deg apart, scale 0.7, slightly dimmed, face forward
- Transitions: `useFrame` lerp (~0.05) for smooth animation
- Interaction: `onClick` on tape meshes
- Hover: non-selected tapes scale 1.0 → 1.05, `cursor: pointer`
- Camera: fixed at `[0, 0, 8]`, fov 40, no OrbitControls

### Step 1: Create vhs-carousel.tsx

```tsx
// src/components/three/vhs-carousel.tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { VHSTapeBox } from "./vhs-tape-box";
import { BioLabel } from "./tape-labels/bio-label";
import { GitHubLabel } from "./tape-labels/github-label";
import { StravaLabel } from "./tape-labels/strava-label";
import { WhoopLabel } from "./tape-labels/whoop-label";
import { BioBack } from "./tape-backs/bio-back";
import { GitHubBack } from "./tape-backs/github-back";
import { StravaBack } from "./tape-backs/strava-back";
import { WhoopBack } from "./tape-backs/whoop-back";
import { CarouselTabs } from "@/components/about/carousel-tabs";
import type { AllStats } from "@/types/stats";

type StatsFromServer = AllStats;

interface TapeConfig {
  id: string;
  label: string;
  accentColor: string;
  spineTitle: string;
}

const TAPES: TapeConfig[] = [
  { id: "bio", label: "Bio", accentColor: "#FED801", spineTitle: "BIO" },
  { id: "github", label: "GitHub", accentColor: "#46157B", spineTitle: "DEV STATS" },
  { id: "strava", label: "Strava", accentColor: "#F85716", spineTitle: "ATHLETICS" },
  { id: "whoop", label: "Whoop", accentColor: "#10BBE4", spineTitle: "RECOVERY" },
];

const SELECTED_POS = new THREE.Vector3(0, 0, 2);
const LERP_SPEED = 0.05;

function getArcPosition(posInArc: number, total: number): THREE.Vector3 {
  const spread = 2.8;
  const center = (total - 1) / 2;
  const x = (posInArc - center) * spread;
  const z = -1 - Math.abs(posInArc - center) * 0.3;
  return new THREE.Vector3(x, 0, z);
}

interface TapeSlotProps {
  index: number;
  selectedIndex: number;
  config: TapeConfig;
  frontLabel: React.ReactNode;
  backContent: React.ReactNode;
  onSelect: () => void;
}

function TapeSlot({
  index,
  selectedIndex,
  config,
  frontLabel,
  backContent,
  onSelect,
}: TapeSlotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const isSelected = index === selectedIndex;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isSelected) {
      // Auto-rotate selected tape
      rotationRef.current += delta * 0.5;
      const targetPos = SELECTED_POS;
      groupRef.current.position.lerp(targetPos, LERP_SPEED);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotationRef.current,
        LERP_SPEED
      );
      const targetScale = 1;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        LERP_SPEED
      );
    } else {
      // Position in arc
      const nonSelected = TAPES
        .map((_, i) => i)
        .filter((i) => i !== selectedIndex);
      const posInArc = nonSelected.indexOf(index);
      const targetPos = getArcPosition(posInArc, nonSelected.length);
      groupRef.current.position.lerp(targetPos, LERP_SPEED);

      // Face forward, snap rotation
      rotationRef.current = 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        LERP_SPEED
      );

      // Scale with hover
      const targetScale = hovered ? 0.75 : 0.7;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        LERP_SPEED
      );
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        if (!isSelected) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <VHSTapeBox
        frontLabel={frontLabel}
        backContent={backContent}
        spineTitle={config.spineTitle}
        accentColor={config.accentColor}
        isSelected={isSelected}
        onClick={onSelect}
      />
    </group>
  );
}

interface CarouselSceneProps {
  stats: StatsFromServer;
  loading: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function CarouselScene({ stats, loading, selectedIndex, onSelect }: CarouselSceneProps) {
  const frontLabels = [<BioLabel key="bio" />, <GitHubLabel key="gh" />, <StravaLabel key="str" />, <WhoopLabel key="wh" />];
  const backContents = [
    <BioBack key="bio" />,
    <GitHubBack key="gh" github={stats.github} loading={loading} />,
    <StravaBack key="str" strava={stats.strava} loading={loading} />,
    <WhoopBack key="wh" whoop={stats.whoop} loading={loading} />,
  ];

  return (
    <>
      <ambientLight intensity={2.0} />
      <directionalLight position={[3, 5, 4]} intensity={2.0} />
      <pointLight position={[-3, 2, -2]} intensity={0.8} color="#4488cc" />

      {TAPES.map((config, i) => (
        <TapeSlot
          key={config.id}
          index={i}
          selectedIndex={selectedIndex}
          config={config}
          frontLabel={frontLabels[i]}
          backContent={backContents[i]}
          onSelect={() => onSelect(i)}
        />
      ))}
    </>
  );
}

export interface VHSCarouselProps {
  stats: StatsFromServer;
  loading: boolean;
}

export function VHSCarousel({ stats, loading }: VHSCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div className="w-full">
      <div className="w-full" style={{ height: "70vh", minHeight: "480px", maxHeight: "720px" }}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 8], fov: 40 }}
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.8,
          }}
          style={{ background: "transparent" }}
        >
          <CarouselScene
            stats={stats}
            loading={loading}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
          />
        </Canvas>
      </div>

      <CarouselTabs
        tapes={TAPES.map((t) => ({ label: t.label, accentColor: t.accentColor }))}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
      />
    </div>
  );
}
```

### Step 2: Verify

Run: `npx tsc --noEmit`
Expected: Errors about missing `CarouselTabs` and `AllStats` from `@/types/stats` — both created in the next tasks. That's expected at this stage.

### Step 3: Commit

```bash
git add src/components/three/vhs-carousel.tsx
git commit -m "feat(about): add VHSCarousel scene with arc layout and selection"
```

---

## Task 5: Create CarouselTabs Component

DOM tab bar below the Canvas, synced with `selectedTape` state.

**Files:**
- Create: `src/components/about/carousel-tabs.tsx`

### Step 1: Create carousel-tabs.tsx

```tsx
// src/components/about/carousel-tabs.tsx
"use client";

interface CarouselTabsProps {
  tapes: { label: string; accentColor: string }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function CarouselTabs({ tapes, selectedIndex, onSelect }: CarouselTabsProps) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {tapes.map((tape, i) => {
        const isActive = i === selectedIndex;
        return (
          <button
            key={tape.label}
            onClick={() => onSelect(i)}
            className="relative px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-all duration-300"
            style={{
              color: isActive ? tape.accentColor : "rgba(255,255,255,0.4)",
              borderBottom: isActive
                ? `2px solid ${tape.accentColor}`
                : "2px solid transparent",
            }}
          >
            {tape.label}
          </button>
        );
      })}
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/about/carousel-tabs.tsx
git commit -m "feat(about): add CarouselTabs tab bar component"
```

---

## Task 6: Update AllStats Type Export

The `AllStats` type is currently defined in `src/hooks/use-stats.ts` (client hook). The carousel imports it from `@/types/stats` so the server component page can also use it without pulling in the client hook.

**Files:**
- Modify: `src/types/stats.ts` — add `AllStats` type
- Modify: `src/hooks/use-stats.ts` — import `AllStats` from `@/types/stats` instead of defining it locally

### Step 1: Add AllStats to types/stats.ts

Add to bottom of `src/types/stats.ts`:

```ts
export interface AllStats {
  github: StatsResponse<GitHubStats>;
  strava: StatsResponse<StravaStats>;
  whoop: StatsResponse<WhoopStats>;
}
```

### Step 2: Update use-stats.ts to re-export from types

Replace the `AllStats` interface in `src/hooks/use-stats.ts` with an import from `@/types/stats`:

Change:
```ts
export interface AllStats {
  github: StatsResponse<GitHubStats>;
  strava: StatsResponse<StravaStats>;
  whoop: StatsResponse<WhoopStats>;
}
```

To:
```ts
export type { AllStats } from "@/types/stats";
import type { AllStats } from "@/types/stats";
```

This ensures existing imports of `AllStats` from `@/hooks/use-stats` still work (like `action-figure-box.tsx`).

### Step 3: Verify

Run: `npx tsc --noEmit`
Expected: No errors — all existing imports of AllStats still resolve.

### Step 4: Commit

```bash
git add src/types/stats.ts src/hooks/use-stats.ts
git commit -m "refactor: move AllStats type to shared types module"
```

---

## Task 7: Create AboutSections Component (SEO)

Server-rendered HTML sections below the carousel displaying the same data in crawlable form.

**Files:**
- Create: `src/components/about/about-sections.tsx`

### Step 1: Create about-sections.tsx

```tsx
// src/components/about/about-sections.tsx
import type { AllStats } from "@/types/stats";

interface AboutSectionsProps {
  stats: AllStats;
}

export function AboutSections({ stats }: AboutSectionsProps) {
  const { github, strava, whoop } = stats;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
      {/* Bio */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-vhs-yellow mb-4">
          Bio
        </h2>
        <h3 className="text-2xl font-bold text-white mb-3">Joe Ramirez</h3>
        <p className="text-white/60 leading-relaxed mb-4">
          Creative developer with 8+ years building for the web. Crafting
          shader-rich interfaces, bold geometry, and handcrafted motion —
          all engineered to perform at production scale.
        </p>
        <div className="flex gap-6 text-sm text-white/40">
          <span>Milwaukee, WI</span>
          <a
            href="https://github.com/tekjoe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vhs-yellow hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/tekjoe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vhs-yellow hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </section>

      {/* Dev Stats */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#46157B] mb-4">
          Dev Stats
        </h2>
        {github.data ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Repos</p>
              <p className="text-xl font-mono text-white">{github.data.repos}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Top Languages</p>
              <p className="text-sm font-mono text-white/70">
                {github.data.topLanguages.join(", ")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30 font-mono">Data unavailable</p>
        )}
      </section>

      {/* Athletics */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#F85716] mb-4">
          Athletics
        </h2>
        {strava.data ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Distance</p>
              <p className="text-xl font-mono text-white">
                {strava.data.totalDistance.toLocaleString()} mi
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">YTD</p>
              <p className="text-xl font-mono text-white">
                {strava.data.ytdDistance.toLocaleString()} mi
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Recent Rides</p>
              <p className="text-xl font-mono text-white">{strava.data.recentRideCount}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30 font-mono">Data unavailable</p>
        )}
      </section>

      {/* Recovery */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#10BBE4] mb-4">
          Recovery
        </h2>
        {whoop.data ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Recovery</p>
              <p className="text-xl font-mono text-white">{whoop.data.recovery}%</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Strain</p>
              <p className="text-xl font-mono text-white">{whoop.data.strain}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Sleep</p>
              <p className="text-xl font-mono text-white">{whoop.data.sleepHours}h</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30 font-mono">Data unavailable</p>
        )}
      </section>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/components/about/about-sections.tsx
git commit -m "feat(about): add crawlable AboutSections for SEO"
```

---

## Task 8: Rewrite About Page as Server Component

Convert `src/app/about/page.tsx` from a client component to a server component with metadata exports and server-side stats fetching. Dynamically imports the VHSCarousel client component.

**Files:**
- Modify: `src/app/about/page.tsx`

**Key changes:**
- Remove `"use client"` directive
- Remove `useStats` hook, replace with server-side fetch
- Add `metadata` export for SEO
- Dynamic import VHSCarousel with `ssr: false`
- Render AboutSections below carousel
- Keep shader background (moves to a client wrapper)

### Step 1: Create about hero client wrapper

Since the shader and carousel need to be client components but the page is a server component, create a thin client wrapper.

Create `src/components/about/about-hero.tsx`:

```tsx
// src/components/about/about-hero.tsx
"use client";

import dynamic from "next/dynamic";
import { LazyShader } from "@/components/shaders/lazy-shader";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type { AllStats } from "@/types/stats";

const VHSCarousel = dynamic(
  () =>
    import("@/components/three/vhs-carousel").then((mod) => mod.VHSCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex items-center justify-center" style={{ height: "70vh" }}>
        <p className="font-mono text-xs text-vhs-yellow animate-pulse">
          LOADING...
        </p>
      </div>
    ),
  }
);

const AboutShaders = dynamic(
  () =>
    import("@/components/shaders/about-shaders").then(
      (mod) => mod.AboutShaders
    ),
  { ssr: false }
);

interface AboutHeroProps {
  stats: AllStats;
  loading: boolean;
}

export function AboutHero({ stats, loading }: AboutHeroProps) {
  const isMobile = useIsMobile();

  return (
    <div className="relative">
      {/* Shader background */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-50" style={{ zIndex: 0 }}>
          <LazyShader>
            <AboutShaders />
          </LazyShader>
        </div>
      )}

      {/* CSS gradient fallback */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          opacity: isMobile ? 0.72 : 0.4,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, #46157B33 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 30% 60%, #0A0A0F 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative" style={{ zIndex: 10 }}>
        <div className="text-center mb-4 pt-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-vhs-yellow mb-2">
            About
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Meet the Developer
          </h1>
          <p className="text-white/50 text-sm mt-3 max-w-md mx-auto">
            Select a tape to learn more. Click to browse, or use the tabs below.
          </p>
        </div>

        <VHSCarousel stats={stats} loading={loading} />
      </div>
    </div>
  );
}
```

### Step 2: Rewrite about/page.tsx

```tsx
// src/app/about/page.tsx
import type { Metadata } from "next";
import type { AllStats } from "@/types/stats";
import type {
  StatsResponse,
  GitHubStats,
  StravaStats,
  WhoopStats,
} from "@/types/stats";
import { AboutHero } from "@/components/about/about-hero";
import { AboutSections } from "@/components/about/about-sections";

export const metadata: Metadata = {
  title: "About | Joe Ramirez — Creative Developer",
  description:
    "Creative developer with 8+ years crafting shader-rich interfaces, bold geometry, and handcrafted motion for the web.",
  openGraph: {
    title: "About | Joe Ramirez",
    description:
      "Creative developer with 8+ years crafting shader-rich interfaces and handcrafted motion.",
    type: "profile",
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function fallback<T>(): StatsResponse<T> {
  return { data: null, lastUpdated: new Date().toISOString(), error: "Not loaded" };
}

async function fetchStats(): Promise<AllStats> {
  const [github, strava, whoop] = await Promise.allSettled([
    fetch(`${BASE_URL}/api/stats/github`, { next: { revalidate: 3600 } }).then(
      (r) => r.json() as Promise<StatsResponse<GitHubStats>>
    ),
    fetch(`${BASE_URL}/api/stats/strava`, { next: { revalidate: 3600 } }).then(
      (r) => r.json() as Promise<StatsResponse<StravaStats>>
    ),
    fetch(`${BASE_URL}/api/stats/whoop`, { next: { revalidate: 3600 } }).then(
      (r) => r.json() as Promise<StatsResponse<WhoopStats>>
    ),
  ]);

  return {
    github: github.status === "fulfilled" ? github.value : fallback<GitHubStats>(),
    strava: strava.status === "fulfilled" ? strava.value : fallback<StravaStats>(),
    whoop: whoop.status === "fulfilled" ? whoop.value : fallback<WhoopStats>(),
  };
}

export default async function AboutPage() {
  const stats = await fetchStats();

  return (
    <div className="relative min-h-screen bg-vhs-bg pt-20">
      <AboutHero stats={stats} loading={false} />
      <AboutSections stats={stats} />
    </div>
  );
}
```

### Step 3: Add NEXT_PUBLIC_BASE_URL to .env

Add to `.env`:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 4: Verify build

Run: `npm run build`
Expected: Builds without errors. The about page should be a dynamic route (server-side rendered at request time due to `fetchStats`).

### Step 5: Commit

```bash
git add src/app/about/page.tsx src/components/about/about-hero.tsx .env
git commit -m "feat(about): rewrite as server component with VHS carousel and SEO sections"
```

---

## Task 9: Final Build Verification

Run the full build and check for any remaining issues.

### Step 1: Run build

Run: `npm run build`
Expected: Clean build with no errors.

### Step 2: Run dev server and visually verify

Run: `npm run dev`

Check:
1. Navigate to `/about` — carousel renders with 4 tapes
2. Click different tapes — selected tape comes to front and auto-rotates
3. Tab bar highlights active tape
4. Back panels show correct content per tape
5. Scroll down — HTML sections are visible
6. View page source — HTML sections are in the markup (SEO)
7. Mobile viewport — tabs are primary navigation, tapes scaled appropriately

### Step 3: Final commit if any fixes needed

```bash
git add -A
git commit -m "fix(about): address build/visual issues from carousel integration"
```

---

## Files Summary

### Create (12 files)
- `src/components/three/vhs-tape-box.tsx` — Reusable single tape mesh
- `src/components/three/tape-labels/bio-label.tsx` — Bio front label
- `src/components/three/tape-labels/github-label.tsx` — GitHub front label
- `src/components/three/tape-labels/strava-label.tsx` — Strava front label
- `src/components/three/tape-labels/whoop-label.tsx` — Whoop front label
- `src/components/three/tape-backs/bio-back.tsx` — Bio back panel
- `src/components/three/tape-backs/github-back.tsx` — GitHub back panel
- `src/components/three/tape-backs/strava-back.tsx` — Strava back panel
- `src/components/three/tape-backs/whoop-back.tsx` — Whoop back panel
- `src/components/three/vhs-carousel.tsx` — Canvas scene with carousel logic
- `src/components/about/carousel-tabs.tsx` — DOM tab bar
- `src/components/about/about-sections.tsx` — Crawlable HTML sections
- `src/components/about/about-hero.tsx` — Client wrapper for shader + carousel

### Modify (3 files)
- `src/app/about/page.tsx` — Server component with metadata + server-side fetch
- `src/types/stats.ts` — Add shared `AllStats` type
- `src/hooks/use-stats.ts` — Import `AllStats` from types module

### Untouched
- `src/components/three/action-figure-box.tsx` — Kept as-is, not deleted
- All work page files, contact page files, API routes
