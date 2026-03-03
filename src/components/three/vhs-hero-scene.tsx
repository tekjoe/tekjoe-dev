"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import * as THREE from "three";

/* ─── Sphere placement ───
   Positions computed via ray-casting from target screen coordinates.
   Spheres float throughout the canvas at various heights.
   Screen positions matched to reference design. */
const SPHERE_DATA = [
  { x:  8.5, y: 1.1, z: -1.0, radius: 0.85, color: "#3a6a85", emissive: "#0d1f33" },  // large blue — far right
  { x:  5.0, y: 0.7, z:  1.0, radius: 0.50, color: "#2d6b42", emissive: "#152e1e" },  // med green — mid right
  { x: -4.7, y: 5.4, z:  1.3, radius: 0.25, color: "#2d6b42", emissive: "#152e1e" },  // small green — base
  { x: -0.5, y: 5.7, z: -2.0, radius: 0.55, color: "#6e3a52", emissive: "#1e0f1e" },  // pink/magenta — far back
  { x:  1.5, y: 1.0, z:  1.0, radius: 0.80, color: "#2d6b42", emissive: "#152e1e" },  // large green — center right
  { x: -4.4, y: 4.3, z:  2.2, radius: 0.44, color: "#a05638", emissive: "#6b2a20" },  // orange — base
  { x: -2.8, y: 3.7, z: -0.5, radius: 0.45, color: "#3a6a85", emissive: "#0d1f33" },  // blue — pushed back
  { x:  0.4, y: 2.5, z:  1.4, radius: 0.60, color: "#a05638", emissive: "#6b2a20" },  // orange — base
  { x: -5.1, y: 3.6, z:  3.1, radius: 0.44, color: "#6e3a52", emissive: "#1e0f1e" },  // pink — base
];

/* ─── Interactive Sphere ─── */
function GlossySphere({
  position,
  radius,
  color,
  emissive,
  index,
  segments = 64,
}: {
  position: [number, number, number];
  radius: number;
  color: string;
  emissive: string;
  index: number;
  segments?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const baseY = position[1];
  const scaleRef = useRef(1);
  const floatRef = useRef(0);

  // Per-sphere idle bob parameters (stable across renders)
  const idleBob = useMemo(() => ({
    speed: 0.4 + (index * 0.17) % 0.5,       // 0.4–0.9 Hz range
    amplitude: 0.06 + (index * 0.023) % 0.06, // 0.06–0.12 range
    offset: index * 1.7,                        // phase offset
  }), [index]);

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => {
    setHovered(false);
    setTapped(false);
  }, []);
  const handleClick = useCallback(() => {
    setTapped(true);
    setTimeout(() => setTapped(false), 600);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Spring-based scale animation
    const targetScale = tapped ? 1.3 : hovered ? 1.18 : 1.0;
    scaleRef.current = THREE.MathUtils.lerp(
      scaleRef.current,
      targetScale,
      tapped ? 0.15 : 0.08
    );
    meshRef.current.scale.setScalar(scaleRef.current);

    // Hover float + wobble
    if (hovered || tapped) {
      floatRef.current = THREE.MathUtils.lerp(floatRef.current, 1, 0.06);
    } else {
      floatRef.current = THREE.MathUtils.lerp(floatRef.current, 0, 0.04);
    }

    const t = state.clock.elapsedTime;
    const floatAmount = floatRef.current;

    // Idle bob (always active) + extra hover bob
    const idleY = Math.sin(t * idleBob.speed + idleBob.offset) * idleBob.amplitude;
    meshRef.current.position.y =
      baseY +
      idleY +
      Math.sin(t * 3) * 0.06 * floatAmount +
      0.15 * floatAmount;

    // Subtle idle rotation
    meshRef.current.rotation.y = t * 0.15;
  });

  const { size } = useThree();
  const mobile = size.width < 768;

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow={!mobile}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[radius, segments, segments]} />
      {mobile ? (
        <meshStandardMaterial
          color={color}
          emissive={hovered || tapped ? emissive : "#000000"}
          emissiveIntensity={hovered || tapped ? 0.4 : 0}
          metalness={0.2}
          roughness={0.15}
        />
      ) : (
        <meshPhysicalMaterial
          color={color}
          emissive={hovered || tapped ? emissive : "#000000"}
          emissiveIntensity={hovered || tapped ? 0.4 : 0}
          metalness={0.2}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={0.9}
        />
      )}
    </mesh>
  );
}

/* ─── Ground plane with grid ─── */
function Ground() {
  return (
    <group>
      {/* Very large ground plane — edges are so far away they
          appear at the horizon and are essentially invisible */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[2, -0.01, 2]}
        receiveShadow
      >
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial
          color="#a09e9c"
          metalness={0.05}
          roughness={0.75}
        />
      </mesh>

      {/* Grid overlay — matches full ground plane */}
      <gridHelper
        args={[400, 300, "#151419", "#151419"]}
        position={[2, 0.005, 2]}
      />
    </group>
  );
}

/* ─── Cursor style manager ─── */
function CursorManager() {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const resetCursor = () => {
      canvas.style.cursor = "default";
    };
    canvas.addEventListener("pointerout", resetCursor);
    return () => canvas.removeEventListener("pointerout", resetCursor);
  }, [gl]);

  return null;
}

/* ─── Scene content ─── */
function SceneContent() {
  const { gl, size } = useThree();
  const isMobile = size.width < 768;

  // On mobile, shift the entire scene up so the ground plane
  // sits higher in the viewport. Because ground + spheres move
  // together, no spheres clip through the plane.
  const mobileYOffset = isMobile ? 1.0 : 0;

  // Change cursor on sphere hover
  const onPointerOverSphere = useCallback(() => {
    gl.domElement.style.cursor = "pointer";
  }, [gl]);

  const onPointerOutSphere = useCallback(() => {
    gl.domElement.style.cursor = "default";
  }, [gl]);

  const spheres = useMemo(
    () =>
      SPHERE_DATA.map((s) => ({
        ...s,
        position: [s.x, s.y, s.z] as [number, number, number],
      })),
    []
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 15, 5]}
        intensity={1.8}
        castShadow={!isMobile}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.002}
      />
      <pointLight position={[-4, 4, -2]} intensity={0.5} color="#4488cc" />
      <pointLight position={[6, 2, 6]} intensity={0.3} color="#cc4444" />

      {/* Hemisphere for subtle color variation */}
      <hemisphereLight
        color="#b0c4de"
        groundColor="#2a1a2e"
        intensity={0.3}
      />

      {/* Scene group — offset up on mobile only */}
      <group position={[0, mobileYOffset, 0]}>
        {/* Ground + grid */}
        <Ground />

        {/* Spheres — fewer segments on mobile */}
        <group
          onPointerOver={onPointerOverSphere}
          onPointerOut={onPointerOutSphere}
        >
          {spheres.map((sphere, i) => (
            <GlossySphere
              key={i}
              index={i}
              position={sphere.position}
              radius={sphere.radius}
              color={sphere.color}
              emissive={sphere.emissive}
              segments={isMobile ? 24 : 64}
            />
          ))}
        </group>
      </group>

      <CursorManager />
    </>
  );
}

function TouchScrollFix() {
  const { gl } = useThree();
  useEffect(() => {
    gl.domElement.style.touchAction = "pan-y";
  }, [gl]);
  return null;
}

/* ─── Main exported scene ─── */
export function VHSHeroScene() {
  const isMobileDevice =
    typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      shadows={!isMobileDevice}
      dpr={isMobileDevice ? [1, 1] : [1, 1.5]}
      camera={{
        position: [-6, 3.5, 9],
        fov: 42,
        near: 0.1,
        far: 500,
      }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: "transparent" }}
      onCreated={({ camera }) => {
        camera.lookAt(3, 6, -2);
        // -17° roll tilts horizon from bottom-left to middle-right
        camera.rotateZ(THREE.MathUtils.degToRad(-17));
      }}
    >
      <TouchScrollFix />
      <SceneContent />
    </Canvas>
  );
}
