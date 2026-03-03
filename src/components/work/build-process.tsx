"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";


const processSteps = [
  {
    number: "01",
    title: "DISCOVER",
    color: "#FED801",
    description:
      "Research, competitive audit, art direction, and technical scoping. We define the shape of the build before a single pixel ships.",
  },
  {
    number: "02",
    title: "DESIGN + BUILD",
    color: "#10BBE4",
    description:
      "Visual systems, component architecture, shader prototyping, and full-stack implementation — all in one tightly coupled pass.",
  },
  {
    number: "03",
    title: "OPTIMIZE",
    color: "#E8258F",
    description:
      "Motion polish, bundle cost reduction, accessibility audit, and analytics wiring. Performance is a feature, not an afterthought.",
  },
];

export function BuildProcess() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ backgroundColor: "#12101A" }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(160deg, rgba(70, 21, 123, 0.15) 0%, rgba(16, 187, 228, 0.08) 50%, transparent 100%)
          `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 py-24">
        {/* Kicker */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="text-vhs-white-muted font-bold uppercase mb-6"
          style={{ fontSize: 12, letterSpacing: 3 }}
        >
          BUILD PROCESS
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.33, 1, 0.68, 1],
          }}
          className="text-vhs-white font-light mb-16"
          style={{
            fontSize: "clamp(32px, 4vw, 50px)",
            lineHeight: 1.15,
            maxWidth: 780,
          }}
        >
          From idea to shipped product in three precise passes.
        </motion.h2>

        {/* Process cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + index * 0.12,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="p-6 border border-white/10"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                minHeight: 250,
              }}
            >
              <p
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: 13,
                  letterSpacing: 2,
                  color: step.color,
                }}
              >
                {step.number} {step.title}
              </p>
              <p
                className="text-vhs-white leading-relaxed"
                style={{ fontSize: 18, lineHeight: 1.5 }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
