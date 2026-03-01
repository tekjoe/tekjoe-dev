"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HeroShaders } from "@/components/shaders/hero-shaders";
import { useIsMobile } from "@/hooks/use-is-mobile";

const VHSHeroScene = dynamic(
  () =>
    import("@/components/three/vhs-hero-scene").then(
      (mod) => mod.VHSHeroScene
    ),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#141318]" />,
  }
);

const HeroBackground = dynamic(
  () =>
    import("@/components/shaders/hero-shaders").then(
      (mod) => mod.HeroBackground
    ),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#141318]" />,
  }
);

function VhsTimecode() {
  const [time, setTime] = useState("00:00:00:00");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const f = String(Math.floor((now.getMilliseconds() / 1000) * 24)).padStart(2, "0");
      setTime(`${h}:${m}:${s}:${f}`);
    };
    update();
    const id = setInterval(update, 42); // ~24fps
    return () => clearInterval(id);
  }, []);

  return <>{time}</>;
}

export function Hero() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden pt-20"
      style={{ backgroundColor: "#141318" }}
    >
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative w-full"
      >
        {/* 16:10 aspect ratio container, capped at viewport height */}
        <div className="relative w-full" style={{ aspectRatio: "16 / 10", maxHeight: "calc(100vh - 5rem)" }}>

          {/* ── Shader background (visible through transparent Three.js sky) ── */}
          {!isMobile && (
            <div className="absolute inset-0" style={{ zIndex: 0 }}>
              <HeroBackground />
            </div>
          )}

          {/* ── Three.js Scene (slope + grid + spheres) ── */}
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <VHSHeroScene />
          </div>

          {/* ── HTML Overlay elements (pointer-events-none so Three.js receives clicks) ── */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>

            {/* "TEKJOE ◄" top-left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="absolute flex items-center gap-2 md:gap-4"
              style={{ left: "3.9%", top: "4.7%" }}
            >
              <span
                className="font-black tracking-wider text-white uppercase"
                style={{
                  fontSize: "clamp(1.5rem, 7.6vw, 110px)",
                  letterSpacing: "0.05em",
                }}
              >
                TEKJOE
              </span>
              <svg
                viewBox="0 0 75 85"
                className="text-white"
                style={{
                  width: "clamp(1rem, 5.2vw, 75px)",
                  height: "auto",
                }}
              >
                <polygon points="0,42.5 75,0 75,85" fill="currentColor" />
              </svg>
            </motion.div>

            {/* Corner metadata top-right */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute text-right"
              style={{ right: "3.9%", top: "3.3%" }}
            >
              <p className="text-white font-bold text-[9px] md:text-sm tracking-widest">
                T-120 HQ
              </p>
              <p className="text-white/70 text-[8px] md:text-xs tracking-wider">
                STEREO READY
              </p>
              <p className="text-vhs-yellow font-medium text-[8px] md:text-xs tracking-wider tabular-nums">
                <VhsTimecode />
              </p>
            </motion.div>

            {/* Rotated text block (-33° rotation) — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -60, rotate: -33 }}
              animate={{ opacity: 1, x: 0, rotate: -33 }}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="absolute origin-top-left hidden md:block"
              style={{
                left: "13.3%",
                top: "33%",
              }}
            >
              <p
                className="text-white font-medium leading-tight"
                style={{ fontSize: "clamp(0.9rem, 1.94vw, 28px)", paddingLeft: "2rem" }}
              >
                Stereo
                <br />
                Ready
              </p>
              <p
                className="text-white font-bold -mt-1"
                style={{
                  fontSize: "clamp(2rem, 6.65vw, 96px)",
                  lineHeight: 1,
                }}
              >
                T-120
              </p>
              <div className="flex items-end gap-2 -mt-1">
                <div>
                  <p
                    className="text-white font-medium"
                    style={{
                      fontSize: "clamp(1rem, 2.5vw, 36px)",
                      lineHeight: 1.2,
                    }}
                  >
                    Video Casette
                  </p>
                  <div
                    className="rounded-sm"
                    style={{
                      width: "clamp(60px, 9.5vw, 137px)",
                      height: "clamp(4px, 0.73vw, 10px)",
                      backgroundColor: "#d9d9d9",
                      marginTop: "2px",
                    }}
                  />
                </div>
              </div>
              <p
                className="font-normal -mt-2"
                style={{
                  fontSize: "clamp(2rem, 6.65vw, 96px)",
                  lineHeight: 1,
                  color: "#aa2b3a",
                }}
              >
                HQ
              </p>
            </motion.div>

            {/* Bottom-left: site identity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute bottom-[6%] md:bottom-[10%]"
              style={{ left: "3.9%" }}
            >
              <p className="text-white font-semibold text-[10px] md:text-sm tracking-widest">
                tekjoe
              </p>
              <p className="text-white/70 text-[9px] md:text-xs mt-0.5 md:mt-1">Creative Developer</p>
            </motion.div>

            {/* Bottom-right: large VHS badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute bottom-[4%] md:bottom-[8%]"
              style={{ right: "3.9%" }}
            >
              <div className="bg-white border-2 md:border-[3px] border-black px-3 md:px-7 py-1.5 md:py-3">
                <span className="font-display text-black text-lg md:text-4xl font-semibold">
                  VHS
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── VHS tracking effect overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 20 }}
          >
            <HeroShaders />
          </div>

          {/* ── CSS scan lines ── */}
          <div
            className="absolute inset-0 scanline-overlay pointer-events-none opacity-[0.06]"
            style={{ zIndex: 21 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
