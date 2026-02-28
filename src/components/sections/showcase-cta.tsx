"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";

const CTAShaders = dynamic(
  () =>
    import("@/components/shaders/cta-shaders").then((mod) => mod.CTAShaders),
  { ssr: false }
);

export function ShowcaseCTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
    >
      {/* Shader background */}
      <div className="absolute inset-0">
        <CTAShaders />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-vhs-bg/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-vhs-yellow mb-6 block">
            Ready to collaborate?
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-vhs-white mb-4">
            Let&apos;s Create
            <br />
            Something{" "}
            <span className="text-vhs-yellow vhs-text-glow">
              Worth Rewinding
            </span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-vhs-gray text-base md:text-lg max-w-md mx-auto mb-10"
        >
          Have a project in mind? I&apos;d love to hear about it. Let&apos;s
          build something great together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="mailto:hello@tekjoe.dev"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-10 py-4 bg-vhs-yellow text-vhs-bg font-bold uppercase tracking-wider hover:bg-vhs-white transition-colors duration-300"
          >
            Get in Touch
          </motion.a>
          <motion.a
            href="https://github.com/tekjoe"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-10 py-4 border-2 border-vhs-yellow text-vhs-yellow font-bold uppercase tracking-wider hover:bg-vhs-yellow hover:text-vhs-bg transition-colors duration-300"
          >
            View GitHub
          </motion.a>
        </motion.div>
      </div>

      {/* Color band at bottom */}
      <div className="absolute bottom-0 left-0 right-0 vhs-color-band" />
    </section>
  );
}
