"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";

const AboutShaders = dynamic(
  () =>
    import("@/components/shaders/about-shaders").then(
      (mod) => mod.AboutShaders
    ),
  { ssr: false }
);

const capabilities = [
  {
    title: "Design",
    description:
      "Brand identity, UI/UX design, design systems, and visual storytelling.",
    color: "#E72026",
  },
  {
    title: "Development",
    description:
      "React, Next.js, TypeScript, Node.js — full-stack web applications.",
    color: "#10BBE4",
  },
  {
    title: "Strategy",
    description:
      "Technical consulting, architecture planning, and digital transformation.",
    color: "#B3C53B",
  },
  {
    title: "Motion",
    description:
      "WebGL, Three.js, Framer Motion, scroll-driven animations, and shaders.",
    color: "#FED801",
  },
];

function CapabilityCard({
  capability,
  index,
}: {
  capability: (typeof capabilities)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="group relative p-6 border border-border bg-vhs-bg/60 backdrop-blur-sm hover:border-opacity-50 transition-all duration-500"
      style={{
        ["--cap-color" as string]: capability.color,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 group-hover:h-1"
        style={{ backgroundColor: capability.color }}
      />

      <span
        className="font-mono text-xs uppercase tracking-widest mb-3 block"
        style={{ color: capability.color }}
      >
        0{index + 1}
      </span>
      <h4 className="text-lg font-bold uppercase tracking-tight text-vhs-white mb-2 group-hover:text-vhs-yellow transition-colors duration-300">
        {capability.title}
      </h4>
      <p className="text-vhs-gray text-sm leading-relaxed">
        {capability.description}
      </p>
    </motion.div>
  );
}

export function About() {
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      className="relative bg-vhs-bg section-padding overflow-hidden"
    >
      {/* Shader background */}
      <div className="absolute inset-0 opacity-20">
        <AboutShaders />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Bio */}
          <div ref={titleRef}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
              className="h-0.5 bg-vhs-yellow mb-8 origin-left max-w-[80px]"
            />

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-vhs-white mb-8"
            >
              About
              <br />
              <span className="text-vhs-yellow">tekjoe</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="space-y-4"
            >
              <p className="text-vhs-white-muted text-base md:text-lg leading-relaxed">
                Web developer with 8+ years of experience crafting digital
                experiences. Self-taught, endlessly curious, and always shipping.
              </p>
              <p className="text-vhs-gray text-sm md:text-base leading-relaxed">
                I build websites and applications for small businesses,
                nonprofits, and enterprise clients. From brand identity systems to
                full-stack platforms, I bring a design-first mindset to every
                project paired with solid engineering fundamentals.
              </p>
              <p className="text-vhs-gray text-sm md:text-base leading-relaxed">
                Currently exploring the intersection of creative coding, AI
                tooling, and modern web technologies.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex gap-8 mt-8 pt-8 border-t border-border"
            >
              {[
                { value: "8+", label: "Years" },
                { value: "30+", label: "Projects" },
                { value: "∞", label: "Curiosity" },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="text-2xl md:text-3xl font-black text-vhs-yellow">
                    {stat.value}
                  </span>
                  <span className="block font-mono text-xs uppercase tracking-widest text-vhs-gray mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Capability cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {capabilities.map((cap, i) => (
              <CapabilityCard key={cap.title} capability={cap} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
