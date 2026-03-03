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
