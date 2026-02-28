"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useStats } from "@/hooks/use-stats";

const ActionFigureScene = dynamic(
  () =>
    import("@/components/three/action-figure-box").then(
      (mod) => mod.ActionFigureScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <p className="font-mono text-xs text-vhs-yellow animate-pulse">
          LOADING...
        </p>
      </div>
    ),
  }
);

export default function AboutPage() {
  const { stats, loading } = useStats();

  return (
    <div className="min-h-screen bg-vhs-bg pt-20 overflow-visible">
      <div className="max-w-6xl mx-auto px-6 overflow-visible">
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-vhs-yellow mb-2">
            About
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Meet the Developer
          </h1>
          <p className="text-white/50 text-sm mt-3 max-w-md mx-auto">
            Drag to rotate. Flip it around to see the stats.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto overflow-visible" style={{ height: "80vh" }}>
          <ActionFigureScene stats={stats} loading={loading} />
        </div>

      </div>
    </div>
  );
}
