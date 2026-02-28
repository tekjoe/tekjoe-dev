"use client";

import type { AllStats } from "@/hooks/use-stats";

interface StatsPanelProps {
  stats: AllStats;
  loading: boolean;
}

function StatValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[8px] uppercase tracking-widest text-black/40">
        {label}
      </span>
      <span className="font-mono text-[10px] text-black tabular-nums">{value}</span>
    </div>
  );
}

function SectionHeader({
  children,
  color = "#46157B",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="border-b border-black/10 pb-0.5 mb-1 flex items-center gap-1.5">
      <div className="w-1 h-2 shrink-0 rounded-sm" style={{ background: color }} />
      <span className="font-mono text-[7px] uppercase tracking-[0.2em]" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

function Unavailable() {
  return (
    <p className="font-mono text-[8px] text-black/30 italic">
      DATA UNAVAILABLE — TRACKING...
    </p>
  );
}

export function StatsPanel({ stats, loading }: StatsPanelProps) {
  const { github, strava, whoop } = stats;

  return (
    <div
      className="w-[280px] h-[420px] text-black relative flex flex-col overflow-hidden"
      style={{
        background: "#efefef",
        border: "1px solid rgba(0,0,0,0.08)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Black header mirroring front T-120 bar */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: "40px", background: "#000000" }}
      >
        <p className="text-[18px] font-black text-white tracking-tight leading-none">
          JOE RAMIREZ
        </p>
      </div>

      {/* Color bands matching front cover */}
      <div className="flex shrink-0" style={{ height: "6px" }}>
        <div className="flex-1" style={{ background: "#46157B" }} />
        <div className="flex-1" style={{ background: "#c33169" }} />
        <div className="flex-1" style={{ background: "#eb2635" }} />
        <div className="flex-1" style={{ background: "#fd8010" }} />
      </div>

      <div className="p-3 flex flex-col flex-1 min-h-0">
      <div className="text-center mb-2 pb-1.5 border-b border-black/10">
        <p className="text-[7px] text-black/40 tracking-widest uppercase">
          Creative Developer Series
        </p>
      </div>

      <div className="mb-2">
        <SectionHeader color="#46157B">Bio</SectionHeader>
        <p className="text-[9px] text-black/60 leading-relaxed">
          8+ years building for the web. Design + code. Crafting interfaces that
          feel as good as they look.
        </p>
      </div>

      <div className="mb-2">
        <SectionHeader color="#c33169">Daily Stats</SectionHeader>
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

      <div className="mb-2">
        <SectionHeader color="#eb2635">Athletics</SectionHeader>
        {strava.data ? (
          <div className="space-y-1">
            <StatValue
              label="Total"
              value={`${strava.data.totalDistance.toLocaleString()} mi`}
            />
            <StatValue
              label="Recent Rides"
              value={`${strava.data.recentRideCount}`}
            />
            <StatValue
              label="YTD"
              value={`${strava.data.ytdDistance.toLocaleString()} mi`}
            />
          </div>
        ) : (
          <Unavailable />
        )}
      </div>

      <div className="mb-2">
        <SectionHeader color="#fd8010">Dev Stats</SectionHeader>
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

      <div className="pt-2 border-t border-black/10 text-center mt-auto">
        <p className="text-[7px] text-black/30 uppercase tracking-widest">
          Accessories not included · Ages 18+
        </p>
      </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <p className="font-mono text-[10px] text-[#46157B] animate-pulse">
            LOADING STATS...
          </p>
        </div>
      )}
    </div>
  );
}
