"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LazyShader } from "@/components/shaders/lazy-shader";
import { WorkHeroShaders } from "@/components/shaders/work-shaders";
import { useIsMobile } from "@/hooks/use-is-mobile";

const VHSTapeScene = dynamic(
  () =>
    import("@/components/three/vhs-tape-scene").then(
      (mod) => mod.VHSTapeScene
    ),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-transparent" />,
  }
);

export function WorkHero() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isMobile = useIsMobile();

  return (
    <section
      ref={ref}
      className="relative w-full overflow-x-hidden pt-20"
      style={{
        backgroundColor: "#0E0D13",
        minHeight: "min(640px, 100vh)",
      }}
    >
      {/* Shader background */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-60" style={{ zIndex: 0 }}>
          <LazyShader>
            <WorkHeroShaders />
          </LazyShader>
        </div>
      )}

      {/* CSS gradient fallback (always visible, shader overlays on top) */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          opacity: isMobile ? 0.72 : 0.4,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, #1B1233 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 70% 30%, #0B2842 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 80%, #1a0a2e 0%, transparent 50%),
            radial-gradient(ellipse 90% 70% at 80% 70%, #0d1f3a 0%, transparent 60%)
          `,
        }}
      />

      {/* Scanlines */}
      <div className="absolute left-0 right-0 h-px" style={{ top: "18%", backgroundColor: "rgba(255,255,255,0.18)", zIndex: 2 }} />
      <div className="absolute left-0 right-0 h-px" style={{ top: "42%", backgroundColor: "rgba(227,32,38,0.33)", zIndex: 2 }} />
      <div className="absolute left-0 right-0 h-px" style={{ top: "64%", backgroundColor: "rgba(16,187,228,0.33)", zIndex: 2 }} />
      <div className="absolute left-0 right-0 h-px" style={{ top: "87%", backgroundColor: "rgba(255,255,255,0.12)", zIndex: 2 }} />

      {/* CSS scanline overlay */}
      <div
        className="absolute inset-0 scanline-overlay pointer-events-none opacity-[0.04]"
        style={{ zIndex: 3 }}
      />

      {/* Content */}
      <div className="relative flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-12 lg:gap-8 max-w-7xl mx-auto px-6 md:px-14 py-16 md:py-24 lg:py-32 overflow-hidden" style={{ zIndex: 10 }}>
        {/* Left column: text */}
        <div className="flex-1 max-w-[720px]">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="text-vhs-yellow font-bold uppercase mb-6"
            style={{
              fontSize: 12,
              letterSpacing: 3,
            }}
          >
            SIDE B &bull; WORK IN FULL COLOR
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
            className="text-vhs-white font-light leading-[1.06] mb-6"
            style={{
              fontSize: "clamp(36px, 5vw, 62px)",
              maxWidth: 720,
            }}
          >
            Funky 3D builds for ambitious product teams.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
            className="text-vhs-white-muted leading-relaxed mb-10"
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 610,
            }}
          >
            Shader-rich interfaces, bold geometry, and handcrafted motion — all
            engineered to perform at production scale.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#projects"
              className="inline-flex items-center px-7 py-3 bg-white text-black font-semibold text-sm tracking-wide uppercase hover:bg-vhs-yellow transition-colors duration-300"
            >
              View Projects
            </a>
            <Link
              href="#contact"
              className="inline-flex items-center px-7 py-3 border border-white/30 text-white font-semibold text-sm tracking-wide uppercase hover:border-vhs-yellow hover:text-vhs-yellow transition-colors duration-300"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>

        {/* 3D VHS tape — oversized canvas prevents clipping during rotation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="relative flex-shrink-0 left-1/2 -translate-x-1/2 w-[90vw] h-[240px] mt-4 lg:mt-0 sm:static sm:translate-x-0 sm:w-full sm:h-[300px] lg:max-w-none lg:w-[640px] lg:h-[540px]"
          style={{ overflow: "visible" }}
        >
          <div style={{ position: "absolute", inset: "-30%", left: isMobile ? "-20%" : "-30%" }}>
            <VHSTapeScene cameraZ={isMobile ? 7 : 10} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
