"use client";

import { Shader, ChromaFlow, Strands } from "shaders/react";

export function CTAShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <ChromaFlow
        baseColor="#46157B"
        upColor="#E72026"
        downColor="#10BBE4"
        leftColor="#FED801"
        rightColor="#E8258F"
        intensity={0.8}
        radius={4}
        momentum={40}
      />
      <Strands
        amplitude={0.8}
        frequency={1.2}
        lineWidth={0.05}
        speed={0.3}
        lineCount={16}
        waveColor="#FED801"
        opacity={0.15}
      />
    </Shader>
  );
}
