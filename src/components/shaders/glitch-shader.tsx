"use client";

import { Shader, Glitch, SimplexNoise } from "shaders/react";

export function GlitchShader() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <SimplexNoise
        colorA="#141318"
        colorB="#0A0A0F"
        scale={3}
        speed={0.5}
        contrast={0.5}
      />
      <Glitch
        intensity={0.4}
        rgbShift={3}
        blockDensity={8}
        scanlineIntensity={0.4}
        colorBarIntensity={0.3}
        mirrorAmount={0.2}
        opacity={0.6}
      />
    </Shader>
  );
}
