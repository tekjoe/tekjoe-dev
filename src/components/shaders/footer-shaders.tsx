"use client";

import { Shader, Strands } from "shaders/react";

export function FooterShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <Strands
        amplitude={0.4}
        frequency={0.8}
        lineWidth={0.03}
        speed={0.2}
        lineCount={8}
        waveColor="#10BBE4"
        opacity={0.1}
      />
    </Shader>
  );
}
