import type { ContributionWeek } from "@/types/stats";

const LEVEL_COLORS = [
  "rgba(255,255,255,0.04)", // 0 — no contributions
  "#0e4429",               // 1
  "#006d32",               // 2
  "#26a641",               // 3
  "#39d353",               // 4
];

interface ContributionGraphProps {
  weeks: ContributionWeek[];
  /** Compact mode for the VHS tape back (smaller cells, no month labels) */
  compact?: boolean;
}

export function ContributionGraph({
  weeks,
  compact = false,
}: ContributionGraphProps) {
  const cellSize = compact ? 5 : 10;
  const gap = compact ? 1 : 2;
  const step = cellSize + gap;

  // Show last N weeks to fit the container
  const maxWeeks = compact ? 26 : 52;
  const visibleWeeks = weeks.slice(-maxWeeks);

  const width = visibleWeeks.length * step;
  const height = 7 * step;

  return (
    <div className="overflow-x-auto vhs-scrollbar-thin">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        {visibleWeeks.map((week, wi) =>
          week.days.map((day, di) => (
            <rect
              key={`${wi}-${di}`}
              x={wi * step}
              y={di * step}
              width={cellSize}
              height={cellSize}
              rx={compact ? 1 : 2}
              fill={LEVEL_COLORS[day.level]}
            >
              <title>{`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}</title>
            </rect>
          ))
        )}
      </svg>
    </div>
  );
}
