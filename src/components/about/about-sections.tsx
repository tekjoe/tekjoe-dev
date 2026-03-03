// src/components/about/about-sections.tsx
import type { AllStats } from "@/types/stats";
import { ContributionGraph } from "@/components/github/contribution-graph";

interface AboutSectionsProps {
  stats: AllStats;
}

export function AboutSections({ stats }: AboutSectionsProps) {
  const { github, strava } = stats;

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
          <span>Madison, WI</span>
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
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Repos</p>
                <p className="text-xl font-mono text-white">{github.data.repos}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Contributions</p>
                <p className="text-xl font-mono text-white">
                  {github.data.contributionsLastYear > 0
                    ? github.data.contributionsLastYear.toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Top Languages</p>
                <p className="text-sm font-mono text-white/70">
                  {github.data.topLanguages.join(", ")}
                </p>
              </div>
            </div>
            {github.data.contributionCalendar?.length > 0 && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Activity</p>
                <ContributionGraph weeks={github.data.contributionCalendar} />
              </div>
            )}
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
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1"><span className="hidden md:inline">Total</span> Distance</p>
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
    </div>
  );
}
