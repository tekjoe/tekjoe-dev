"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";


export function OutcomesStrip() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: "#0E0D14",
        minHeight: 420,
      }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(232, 37, 143, 0.08) 0%, rgba(254, 216, 1, 0.06) 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1000px] mx-auto px-6 md:px-14 py-20">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="text-vhs-white font-light text-center"
          style={{
            fontSize: "clamp(28px, 3.5vw, 44px)",
            lineHeight: 1.25,
          }}
        >
          Built for impact: faster delivery cycles, cleaner systems, and
          interfaces people remember.
        </motion.p>
      </div>
    </section>
  );
}
