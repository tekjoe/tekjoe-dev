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
