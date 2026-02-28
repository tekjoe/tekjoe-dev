"use client";

import { Shader, Aurora, FloatingParticles, FilmGrain } from "shaders/react";

export function HeroBackground() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <Aurora
        colorA="#46157B"
        colorB="#10BBE4"
        colorC="#E72026"
        speed={2}
        intensity={60}
        waviness={40}
        rayDensity={15}
        height={100}
      />
      <FloatingParticles
        count={5}
        particleColor="#FED801"
        particleSize={0.4}
        particleSoftness={0.9}
        twinkle={0.8}
        speed={0.1}
        opacity={0.3}
      />
      <FilmGrain
        strength={0.1}
      />
    </Shader>
  );
}

export function HeroShaders() {
  return (
    <>
      <div className="vhs-tracking-overlay">
        <div className="vhs-scan-line vhs-scan-line-1" style={{ height: 2 }} />
        <div className="vhs-scan-line vhs-scan-line-2" style={{ height: 5 }} />
        <div className="vhs-scan-line vhs-scan-line-3" style={{ height: 8 }} />
        <div className="vhs-scan-line vhs-scan-line-4" style={{ height: 3 }} />
        <div className="vhs-scan-line vhs-scan-line-5" style={{ height: 6 }} />
      </div>
      <div className="vhs-grain" />
      <svg className="hidden">
        <filter id="vhs-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
    </>
  );
}
