"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";
import * as THREE from "three";
import { VHSTapeBox } from "./vhs-tape-box";
import { BioLabel } from "./tape-labels/bio-label";
import { GitHubLabel } from "./tape-labels/github-label";
import { StravaLabel } from "./tape-labels/strava-label";
import { BioBack } from "./tape-backs/bio-back";
import { GitHubBack } from "./tape-backs/github-back";
import { StravaBack } from "./tape-backs/strava-back";
import { CarouselTabs } from "@/components/about/carousel-tabs";
import type { AllStats } from "@/types/stats";

interface TapeConfig {
  id: string;
  label: string;
  accentColor: string;
  spineTitle: string;
}

const TAPES: TapeConfig[] = [
  { id: "bio", label: "Bio", accentColor: "#FED801", spineTitle: "BIO" },
  {
    id: "github",
    label: "GitHub",
    accentColor: "#46157B",
    spineTitle: "DEV STATS",
  },
  {
    id: "strava",
    label: "Strava",
    accentColor: "#F85716",
    spineTitle: "ATHLETICS",
  },
];

const NUM_TAPES = 3;
const ANGLE_STEP = (Math.PI * 2) / NUM_TAPES;
const CAROUSEL_RADIUS = 4.5;
const LERP_SPEED = 0.04;
const SELF_ROTATE_SPEED = 0.4;
const DRAG_SENSITIVITY = 0.01;
const RESUME_DELAY = 2000;
const DRAG_THRESHOLD = 5; // px before deciding gesture direction

/** Shared mutable drag state — read by useFrame, written by DOM events */
interface DragState {
  active: boolean;
  rotation: number;
}

const DragContext = createContext<React.RefObject<DragState>>({
  current: { active: false, rotation: 0 },
});

function lerpAngle(current: number, target: number, t: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * t;
}

function getZOrder(tapeIndex: number, selectedIndex: number): number {
  const dist = Math.abs(tapeIndex - selectedIndex);
  const wrappedDist = Math.min(dist, NUM_TAPES - dist);
  if (wrappedDist === 0) return 20;
  return 8;
}

// ─── Individual tape slot ────────────────────────────────────────────

interface TapeSlotProps {
  index: number;
  config: TapeConfig;
  frontLabel: React.ReactNode;
  backContent: React.ReactNode;
  onSelect: () => void;
  zOrder: number;
  isSelected: boolean;
}

function TapeSlot({
  index,
  config,
  frontLabel,
  backContent,
  onSelect,
  zOrder,
  isSelected,
}: TapeSlotProps) {
  const spinRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);
  const autoAngle = useRef(0);
  const dragRef = useContext(DragContext);

  const angle = index * ANGLE_STEP;
  const x = CAROUSEL_RADIUS * Math.sin(angle);
  const z = CAROUSEL_RADIUS * Math.cos(angle);

  useFrame((_, delta) => {
    if (!spinRef.current) return;

    const target = hovered ? 1.05 : 1;
    scaleRef.current += (target - scaleRef.current) * Math.min(delta * 8, 1);
    spinRef.current.scale.setScalar(scaleRef.current);

    const drag = dragRef.current;
    if (isSelected && drag && drag.active) {
      spinRef.current.rotation.y = drag.rotation;
      autoAngle.current = drag.rotation;
    } else {
      autoAngle.current += delta * SELF_ROTATE_SPEED;
      spinRef.current.rotation.y = autoAngle.current;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <group
        ref={spinRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      >
        <VHSTapeBox
          frontLabel={frontLabel}
          backContent={backContent}
          spineTitle={config.spineTitle}
          accentColor={config.accentColor}
          onClick={onSelect}
          zOrder={zOrder}
        />
      </group>
    </group>
  );
}

// ─── Lazy-susan parent ───────────────────────────────────────────────

function LazySusan({
  selectedIndex,
  children,
}: {
  selectedIndex: number;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetAngle = -selectedIndex * ANGLE_STEP;
    currentAngle.current = lerpAngle(
      currentAngle.current,
      targetAngle,
      LERP_SPEED
    );
    groupRef.current.rotation.y = currentAngle.current;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Scene contents ──────────────────────────────────────────────────

interface CarouselSceneProps {
  stats: AllStats;
  loading: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function CarouselScene({
  stats,
  loading,
  selectedIndex,
  onSelect,
}: CarouselSceneProps) {
  const frontLabels = [
    <BioLabel key="bio" />,
    <GitHubLabel key="gh" />,
    <StravaLabel key="str" />,
  ];
  const backContents = [
    <BioBack key="bio" />,
    <GitHubBack key="gh" github={stats.github} loading={loading} />,
    <StravaBack key="str" strava={stats.strava} loading={loading} />,
  ];

  return (
    <>
      <CanvasSetup />
      <ambientLight intensity={2.0} />
      <directionalLight position={[3, 5, 4]} intensity={2.0} />
      <pointLight position={[-3, 2, -2]} intensity={0.8} color="#4488cc" />

      <LazySusan selectedIndex={selectedIndex}>
        {TAPES.map((config, i) => (
          <TapeSlot
            key={config.id}
            index={i}
            config={config}
            frontLabel={frontLabels[i]}
            backContent={backContents[i]}
            onSelect={() => onSelect(i)}
            zOrder={getZOrder(i, selectedIndex)}
            isSelected={i === selectedIndex}
          />
        ))}
      </LazySusan>
    </>
  );
}

function CanvasSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.domElement.style.cursor = "pointer";
    gl.domElement.style.touchAction = "pan-y";
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [gl]);
  return null;
}

// ─── Public component ────────────────────────────────────────────────

export interface VHSCarouselProps {
  stats: AllStats;
  loading: boolean;
}

export function VHSCarousel({ stats, loading }: VHSCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dragState = useRef<DragState>({ active: false, rotation: 0 });
  const lastX = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const pointerId = useRef<number | null>(null);
  const dragging = useRef(false);
  const gestureDecided = useRef(false);
  const isHorizontal = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    lastX.current = e.clientX;
    pointerId.current = e.pointerId;
    dragging.current = false;
    gestureDecided.current = false;
    isHorizontal.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerId.current === null) return;

      const dx = Math.abs(e.clientX - startX.current);
      const dy = Math.abs(e.clientY - startY.current);

      // Decide gesture direction once past threshold
      if (!gestureDecided.current) {
        if (Math.max(dx, dy) < DRAG_THRESHOLD) return;
        gestureDecided.current = true;
        isHorizontal.current = dx > dy;
        if (!isHorizontal.current) {
          // Vertical gesture — abandon tracking, let browser scroll
          pointerId.current = null;
          return;
        }
      }

      if (!isHorizontal.current) return;

      // Horizontal drag — capture and rotate
      if (!dragging.current) {
        dragging.current = true;
        dragState.current.active = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }

      const moveDx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      dragState.current.rotation += moveDx * DRAG_SENSITIVITY;
    },
    []
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerId.current === null) return;
      if (dragging.current) {
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
        dragState.current.active = false;
        resumeTimer.current = setTimeout(() => {
          dragState.current.active = false;
        }, RESUME_DELAY);
      }
      pointerId.current = null;
      dragging.current = false;
      gestureDecided.current = false;
      isHorizontal.current = false;
    },
    []
  );

  return (
    <DragContext.Provider value={dragState}>
      <div className="w-full">
        <div
          ref={wrapperRef}
          className="w-full touch-pan-y"
          style={{ height: "70vh", minHeight: "480px", maxHeight: "720px" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onLostPointerCapture={onPointerUp}
        >
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.5, 11], fov: 45 }}
            gl={{
              alpha: true,
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.8,
            }}
            style={{ background: "transparent" }}
          >
            <CarouselScene
              stats={stats}
              loading={loading}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
            />
          </Canvas>
        </div>

        <CarouselTabs
          tapes={TAPES.map((t) => ({
            label: t.label,
            accentColor: t.accentColor,
          }))}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
        />
      </div>
    </DragContext.Provider>
  );
}
