"use client";

import {
  Shader,
  Aurora,
  FloatingParticles,
  FilmGrain,
  Plasma,
  Strands,
  SimplexNoise,
  ChromaFlow,
} from "shaders/react";

/** Hero — cinematic aurora with VHS color palette */
export function WorkHeroShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <Aurora
        colorA="#1B1233"
        colorB="#0B2842"
        colorC="#46157B"
        speed={1.5}
        intensity={50}
        waviness={35}
        rayDensity={12}
        height={100}
      />
      <FloatingParticles
        count={4}
        particleColor="#FED801"
        particleSize={0.3}
        particleSoftness={0.9}
        twinkle={0.7}
        speed={0.08}
        opacity={0.2}
      />
      <FilmGrain strength={0.08} />
    </Shader>
  );
}

/** Project Ledger — subtle noise texture */
export function LedgerShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <SimplexNoise
        colorA="#0C0C12"
        colorB="#14121e"
        scale={4}
        speed={0.3}
        contrast={0.4}
      />
      <Strands
        amplitude={0.3}
        frequency={0.6}
        lineWidth={0.02}
        speed={0.15}
        lineCount={6}
        waveColor="#FED801"
        opacity={0.04}
      />
    </Shader>
  );
}

/** Build Process — plasma with purple-teal tones */
export function BuildProcessShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <Plasma
        density={1.2}
        intensity={0.8}
        contrast={0.6}
        colorA="#46157B"
        colorB="#0B2842"
        speed={0.6}
        warp={0.25}
      />
      <FloatingParticles
        count={3}
        particleColor="#10BBE4"
        particleSize={0.4}
        particleSoftness={0.8}
        twinkle={0.5}
        speed={0.1}
        opacity={0.25}
      />
      <FilmGrain strength={0.06} />
    </Shader>
  );
}

/** Outcomes Strip — chroma flow with pink-to-gold gradient */
export function OutcomesShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <ChromaFlow
        baseColor="#0E0D14"
        upColor="#E8258F"
        downColor="#FED801"
        leftColor="#46157B"
        rightColor="#F85716"
        intensity={0.6}
        radius={5}
        momentum={30}
      />
      <FilmGrain strength={0.05} />
    </Shader>
  );
}

/** Tape Metadata footer — minimal strands */
export function TapeMetadataShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <Strands
        amplitude={0.3}
        frequency={0.5}
        lineWidth={0.02}
        speed={0.15}
        lineCount={5}
        waveColor="#FED801"
        opacity={0.06}
      />
    </Shader>
  );
}
