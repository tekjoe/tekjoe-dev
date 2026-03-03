"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { StatsPanel } from "./stats-panel";
import type { AllStats } from "@/hooks/use-stats";

// VHS tape case proportions (standing upright)
const BOX_W = 2.4;
const BOX_H = 3.6;
const BOX_D = 0.5;

function BoxFace({
  position,
  rotation,
  size,
  color,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}


function FrontLabel() {
  return (
    <div
      className="w-[280px] h-[420px] relative select-none overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* Black top section with T-120 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: "140px", background: "#000000" }}
      >
        <span className="text-[80px] font-black text-white tracking-tight leading-none">
          T-120
        </span>
      </div>

      {/* Color bands */}
      <div className="absolute left-0 right-0" style={{ top: "140px" }}>
        <div style={{ height: "22px", background: "#46157B" }} />
        <div style={{ height: "26px", background: "#c33169" }} />
        <div style={{ height: "22px", background: "#eb2635" }} />
        <div style={{ height: "26px", background: "#fd8010" }} />
      </div>

      {/* Light gray lower section */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{ top: "236px", background: "#efefef" }}
      />

      {/* Dark tab/arrow on right side */}
      <svg
        className="absolute"
        style={{ right: "0", top: "250px" }}
        width="60"
        height="100"
        viewBox="0 0 60 100"
      >
        <polygon points="60,0 0,50 60,100" fill="#3f3f3f" />
      </svg>

      {/* VHS logo — bottom left */}
      <div
        className="absolute bottom-[14px] left-[10px] bg-white px-[6px] py-[3px]"
        style={{ border: "2px solid black" }}
      >
        <span
          className="text-[14px] font-semibold text-black"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          VHS
        </span>
      </div>
    </div>
  );
}

function SpineLabel() {
  return (
    <div
      className="relative select-none overflow-hidden"
      style={{
        width: "60px",
        height: "420px",
        background: "#1a1a1a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* White label area with grid */}
      <div
        className="absolute"
        style={{
          top: "20px",
          left: "6px",
          right: "6px",
          bottom: "60px",
          background: "#e8e4df",
          borderRadius: "4px",
        }}
      >
        {/* Grid lines */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: "4px",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 19px, #c8c4bf 19px, #c8c4bf 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #c8c4bf 19px, #c8c4bf 20px)",
          }}
        />
      </div>

      {/* Dark tab area at bottom */}
      <div
        className="absolute"
        style={{
          bottom: "8px",
          left: "10px",
          right: "10px",
          height: "40px",
          background: "#2a2a2a",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

function VHSTapeModel({
  stats,
  loading,
}: {
  stats: AllStats;
  loading: boolean;
}) {
  const faceColor = "#2d2830";
  const sideColor = "#231f28";
  const groupRef = useRef<THREE.Group>(null);
  const [backFaceVisible, setBackFaceVisible] = useState(false);
  const [frontFaceVisible, setFrontFaceVisible] = useState(true);
  const [rightFaceVisible, setRightFaceVisible] = useState(false);
  const backNormal = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  const frontNormal = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const rightNormal = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const worldNormal = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(worldPos);
    camDir.copy(camera.position).sub(worldPos).normalize();

    // Back face visibility
    worldNormal.copy(backNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    const backDot = worldNormal.dot(camDir);
    setBackFaceVisible(backDot > 0.15);

    // Front face visibility
    worldNormal.copy(frontNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    const frontDot = worldNormal.dot(camDir);
    setFrontFaceVisible(frontDot > 0.15);

    // Right face visibility
    worldNormal.copy(rightNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    const rightDot = worldNormal.dot(camDir);
    setRightFaceVisible(rightDot > 0.15);
  });

  return (
    <group ref={groupRef}>
      {/* Front face */}
      <BoxFace position={[0, 0, BOX_D / 2]} size={[BOX_W, BOX_H]} color={faceColor} />

      {/* Front label */}
      {frontFaceVisible && (
        <Html
          position={[0, 0, BOX_D / 2 + 0.01]}
          transform
          distanceFactor={3.4}
          zIndexRange={[1, 0]}
          center
        >
          <FrontLabel />
        </Html>
      )}

      {/* Back face */}
      <BoxFace position={[0, 0, -BOX_D / 2]} rotation={[0, Math.PI, 0]} size={[BOX_W, BOX_H]} color={faceColor} />

      {/* Stats panel on back */}
      {backFaceVisible && (
        <Html
          position={[0, 0, -BOX_D / 2 - 0.01]}
          rotation={[0, Math.PI, 0]}
          transform
          distanceFactor={3.4}
          zIndexRange={[1, 0]}
          center
        >
          <StatsPanel stats={stats} loading={loading} />
        </Html>
      )}

      {/* Sides */}
      <BoxFace position={[-BOX_W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} size={[BOX_D, BOX_H]} color="#efefef" />
      <BoxFace position={[BOX_W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} size={[BOX_D, BOX_H]} color={sideColor} />
      <BoxFace position={[0, BOX_H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} size={[BOX_W, BOX_D]} color={sideColor} />
      <BoxFace position={[0, -BOX_H / 2, 0]} rotation={[Math.PI / 2, 0, 0]} size={[BOX_W, BOX_D]} color={sideColor} />

      {/* Spine label on right face */}
      {rightFaceVisible && (
        <Html
          position={[BOX_W / 2 + 0.01, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          transform
          distanceFactor={3.4}
          zIndexRange={[1, 0]}
          center
        >
          <SpineLabel />
        </Html>
      )}
    </group>
  );
}

export function ActionFigureScene({
  stats,
  loading,
}: {
  stats: AllStats;
  loading: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 90 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.8,
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={2.0} />
      <directionalLight position={[3, 5, 4]} intensity={2.0} />
      <pointLight position={[-3, 2, -2]} intensity={0.8} color="#4488cc" />

      <VHSTapeModel stats={stats} loading={loading} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
        minPolarAngle={Math.PI / 2 - 0.3}
        maxPolarAngle={Math.PI / 2 + 0.3}
      />
    </Canvas>
  );
}
