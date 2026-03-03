"use client";

import { Shader, ChromaFlow } from "shaders/react";

export function ContactShaders() {
  return (
    <Shader style={{ width: "100%", height: "100%" }}>
      <ChromaFlow
        baseColor="#0E0D13"
        upColor="#46157B"
        downColor="#10BBE4"
        leftColor="#FED801"
        rightColor="#E8258F"
        intensity={0.4}
        radius={3}
        momentum={50}
      />
    </Shader>
  );
}
