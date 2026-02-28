"use client";

import { Shader, Plasma, FloatingParticles } from "shaders/react";

export function AboutShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <Plasma
        density={1.5}
        intensity={1}
        contrast={0.8}
        colorA="#46157B"
        colorB="#0A0A0F"
        speed={0.8}
        warp={0.3}
      />
      <FloatingParticles
        count={3}
        particleColor="#FED801"
        particleSize={0.6}
        particleSoftness={0.8}
        twinkle={0.6}
        speed={0.15}
        opacity={0.4}
      />
    </Shader>
  );
}
