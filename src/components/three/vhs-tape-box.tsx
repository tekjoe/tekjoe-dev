"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const BOX_W = 2.4;
const BOX_H = 3.6;
const BOX_D = 0.5;

const FACE_COLOR = "#2d2830";
const SIDE_COLOR = "#231f28";
const LEFT_COLOR = "#1a1a1a";

interface VHSTapeBoxProps {
  frontLabel: React.ReactNode;
  backContent: React.ReactNode;
  spineTitle: string;
  accentColor: string;
  onClick: () => void;
  /** Higher values render on top of lower values in the DOM overlay */
  zOrder?: number;
}

export function VHSTapeBox({
  frontLabel,
  backContent,
  spineTitle,
  accentColor,
  onClick,
  zOrder = 10,
}: VHSTapeBoxProps) {
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

    worldNormal.copy(backNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    setBackFaceVisible(worldNormal.dot(camDir) > 0.0);

    worldNormal.copy(frontNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    setFrontFaceVisible(worldNormal.dot(camDir) > 0.0);

    worldNormal.copy(rightNormal);
    groupRef.current.localToWorld(worldNormal);
    worldNormal.sub(worldPos).normalize();
    setRightFaceVisible(worldNormal.dot(camDir) > 0.0);
  });

  const zHigh = zOrder + 5;
  const zLow = zOrder;

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Single solid box — no edge gaps */}
      <mesh>
        <boxGeometry args={[BOX_W, BOX_H, BOX_D]} />
        {/* boxGeometry face order: +x, -x, +y, -y, +z (front), -z (back) */}
        <meshStandardMaterial attach="material-0" color={SIDE_COLOR} />
        <meshStandardMaterial attach="material-1" color={LEFT_COLOR} />
        <meshStandardMaterial attach="material-2" color={SIDE_COLOR} />
        <meshStandardMaterial attach="material-3" color={SIDE_COLOR} />
        <meshStandardMaterial attach="material-4" color={FACE_COLOR} />
        <meshStandardMaterial attach="material-5" color={FACE_COLOR} />
      </mesh>

      {frontFaceVisible && (
        <Html
          position={[0, 0, BOX_D / 2 + 0.01]}
          transform
          distanceFactor={3.4}
          zIndexRange={[zHigh, zLow]}
          center
          style={{ pointerEvents: "none", cursor: "pointer" }}
        >
          <div
            style={{ cursor: "pointer", pointerEvents: "auto", animation: "fadeIn 0.3s ease-out" }}
            onClick={onClick}
          >
            {frontLabel}
          </div>
        </Html>
      )}

      {backFaceVisible && (
        <Html
          position={[0, 0, -BOX_D / 2 - 0.01]}
          rotation={[0, Math.PI, 0]}
          transform
          distanceFactor={3.4}
          zIndexRange={[zHigh, zLow]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{ cursor: "pointer", pointerEvents: "auto", animation: "fadeIn 0.3s ease-out" }}
            onClick={onClick}
          >
            {backContent}
          </div>
        </Html>
      )}

      {rightFaceVisible && (
        <Html
          position={[BOX_W / 2 + 0.01, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          transform
          distanceFactor={3.4}
          zIndexRange={[zHigh, zLow]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{ cursor: "pointer", pointerEvents: "auto", animation: "fadeIn 0.3s ease-out" }}
            onClick={onClick}
          >
            <SpineLabel title={spineTitle} accentColor={accentColor} />
          </div>
        </Html>
      )}
    </group>
  );
}

function SpineLabel({ title, accentColor }: { title: string; accentColor: string }) {
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
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "4px", background: accentColor }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: accentColor }}
        >
          {title}
        </span>
      </div>
      <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2">
        <span className="text-[6px] font-semibold text-white/30 uppercase tracking-widest">
          VHS
        </span>
      </div>
    </div>
  );
}
