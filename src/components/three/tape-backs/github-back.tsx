// src/components/three/tape-backs/github-back.tsx
import type { StatsResponse, GitHubStats } from "@/types/stats";
import { ContributionGraph } from "@/components/github/contribution-graph";

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
              {github.data.contributionsLastYear > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[8px] uppercase tracking-widest text-white/40">
                    Contributions
                  </span>
                  <span className="font-mono text-[10px] text-white/80">
                    {github.data.contributionsLastYear.toLocaleString()}
                  </span>
                </div>
              )}
              
            </div>

            {github.data.contributionCalendar?.length > 0 && (
              <div className="mb-4">
                <span className="text-[8px] uppercase tracking-widest text-white/40 block mb-2">
                  Activity
                </span>
                <ContributionGraph
                  weeks={github.data.contributionCalendar}
                  compact
                />
              </div>
            )}

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
