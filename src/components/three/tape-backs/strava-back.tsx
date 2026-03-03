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
