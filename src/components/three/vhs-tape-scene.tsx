"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Cassette proportions (lying flat, wider than tall)
const SHELL_W = 3.9;
const SHELL_H = 2.4;
const SHELL_D = 0.42;

function CassetteLabel() {
  return (
    <div
      className="relative select-none overflow-hidden"
      style={{
        width: "400px",
        height: "248px",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Label background */}
      <div
        className="absolute inset-0"
        style={{
          background: "#111116",
          border: "2px solid #2a2a30",
          borderRadius: "3px",
        }}
      />

      {/* Brand text */}
      <span
        className="absolute font-bold"
        style={{
          top: 14,
          left: 18,
          fontSize: 22,
          letterSpacing: 2,
          color: "#FED801",
        }}
      >
        tekjoe
      </span>

      {/* Subtitle */}
      <span
        className="absolute"
        style={{
          top: 40,
          left: 18,
          fontSize: 9,
          letterSpacing: 1.5,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Creative Developer
      </span>

      {/* T-120 HQ */}
      <span
        className="absolute font-semibold"
        style={{
          top: 12,
          right: 18,
          fontSize: 12,
          letterSpacing: 2,
          color: "#fff",
        }}
      >
        T-120 HQ
      </span>

      {/* STEREO READY */}
      <span
        className="absolute"
        style={{
          top: 30,
          right: 18,
          fontSize: 8,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        STEREO READY
      </span>

      {/* Left reel window */}
      <div
        className="absolute rounded-full"
        style={{
          top: 58,
          left: 72,
          width: 74,
          height: 74,
          backgroundColor: "#06060a",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: 5,
            left: 5,
            width: 64,
            height: 64,
            backgroundColor: "#1e1510",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: 21,
            left: 21,
            width: 32,
            height: 32,
            backgroundColor: "#d4cfc5",
          }}
        />
      </div>

      {/* Right reel window */}
      <div
        className="absolute rounded-full"
        style={{
          top: 58,
          left: 254,
          width: 74,
          height: 74,
          backgroundColor: "#06060a",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: 8,
            left: 8,
            width: 58,
            height: 58,
            backgroundColor: "#1e1510",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: 21,
            left: 21,
            width: 32,
            height: 32,
            backgroundColor: "#d4cfc5",
          }}
        />
      </div>

      {/* Shell seam */}
      <div
        className="absolute"
        style={{
          top: 118,
          left: 4,
          width: 392,
          height: 1,
          backgroundColor: "#0c0c12",
        }}
      />

      {/* Rainbow color bands */}
      <div className="absolute flex" style={{ top: 144, left: 12 }}>
        {[
          "#46157B",
          "#E8258F",
          "#E72026",
          "#F85716",
          "#FED801",
        ].map((color) => (
          <div
            key={color}
            style={{ width: 75, height: 7, backgroundColor: color }}
          />
        ))}
      </div>

      {/* Bottom tape window */}
      <div
        className="absolute rounded-sm"
        style={{
          top: 170,
          left: 28,
          width: 344,
          height: 28,
          backgroundColor: "#08080c",
        }}
      >
        <div
          className="absolute"
          style={{
            top: 10,
            left: 16,
            width: 312,
            height: 5,
            backgroundColor: "#2a1a10",
          }}
        />
      </div>

      {/* SIDE B label */}
      <span
        className="absolute font-bold"
        style={{
          bottom: 8,
          left: 18,
          fontSize: 8,
          letterSpacing: 3,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        SIDE B
      </span>
    </div>
  );
}

function CassetteModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [topFaceVisible, setTopFaceVisible] = useState(true);
  const topNormal = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const worldNormal = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(worldPos);
    camDir.copy(camera.position).sub(worldPos).normalize();

    worldNormal.copy(topNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    const dot = worldNormal.dot(camDir);
    setTopFaceVisible(dot > 0.1);
  });

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0]} position={[0, 0.15, 0]}>
      {/* Main cassette shell */}
      <RoundedBox
        args={[SHELL_W, SHELL_D, SHELL_H]}
        radius={0.06}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#1a1a22"
          roughness={0.35}
          metalness={0.1}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
        />
      </RoundedBox>

      {/* Top face — label overlay */}
      {topFaceVisible && (
        <Html
          position={[0, SHELL_D / 2 + 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          transform
          distanceFactor={3.6}
          zIndexRange={[1, 0]}
          center
        >
          <CassetteLabel />
        </Html>
      )}

      {/* Grip ridges along the back edge */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            -0.5 + i * 0.2,
            SHELL_D / 2 + 0.005,
            -SHELL_H / 2 + 0.05,
          ]}
        >
          <boxGeometry args={[0.08, 0.015, 0.04]} />
          <meshStandardMaterial color="#28282e" />
        </mesh>
      ))}

      {/* Bottom face — darker plastic */}
      <mesh position={[0, -SHELL_D / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SHELL_W, SHELL_H]} />
        <meshStandardMaterial color="#0e0e14" side={THREE.FrontSide} />
      </mesh>

      {/* Front edge color strip (the rainbow bands visible from front) */}
      {[
        { color: "#46157B", offset: -0.7 },
        { color: "#E8258F", offset: -0.35 },
        { color: "#E72026", offset: 0 },
        { color: "#F85716", offset: 0.35 },
        { color: "#FED801", offset: 0.7 },
      ].map((band) => (
        <mesh
          key={band.color}
          position={[band.offset, 0, SHELL_H / 2 + 0.001]}
        >
          <planeGeometry args={[0.34, SHELL_D * 0.4]} />
          <meshStandardMaterial
            color={band.color}
            emissive={band.color}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}

      {/* Reel hubs — flat cylinders sitting on top of shell */}
      {[
        { x: -0.85, z: -0.15 },
        { x: 0.85, z: -0.15 },
      ].map((reel, i) => (
        <group key={i} position={[reel.x, SHELL_D / 2, reel.z]}>
          {/* Window recess */}
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.03, 32]} />
            <meshStandardMaterial color="#06060a" />
          </mesh>
          {/* Tape spool */}
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[i === 0 ? 0.35 : 0.3, i === 0 ? 0.35 : 0.3, 0.02, 32]} />
            <meshStandardMaterial color="#1e1510" />
          </mesh>
          {/* Hub center */}
          <mesh position={[0, 0.025, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
            <meshStandardMaterial color="#d4cfc5" metalness={0.2} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Tape window (bottom front) */}
      <mesh position={[0, SHELL_D / 2 - 0.01, 0.6]}>
        <boxGeometry args={[2.2, 0.03, 0.28]} />
        <meshStandardMaterial color="#08080c" />
      </mesh>

      {/* Tape strip inside window */}
      <mesh position={[0, SHELL_D / 2 - 0.005, 0.6]}>
        <boxGeometry args={[1.8, 0.01, 0.05]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
    </group>
  );
}

export function VHSTapeScene({ cameraZ = 7.5 }: { cameraZ?: number }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.5, cameraZ], fov: 32 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.6,
      }}
      style={{ background: "transparent" }}
    >
      {/* Lighting */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 6, 4]} intensity={1.8} />
      <pointLight position={[-3, 3, -2]} intensity={0.6} color="#4488cc" />
      <pointLight position={[4, 1, 3]} intensity={0.4} color="#E8258F" />
      <hemisphereLight color="#b0c4de" groundColor="#1a0a2e" intensity={0.3} />

      <CassetteModel />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.2}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2 + 0.15}
      />
    </Canvas>
  );
}
