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
