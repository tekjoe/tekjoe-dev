"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { LazyShader } from "@/components/shaders/lazy-shader";
import { ContactForm } from "@/components/contact/contact-form";
import { useIsMobile } from "@/hooks/use-is-mobile";

const ContactShaders = dynamic(
  () =>
    import("@/components/shaders/contact-shaders").then(
      (mod) => mod.ContactShaders
    ),
  { ssr: false }
);

const ease = [0.33, 1, 0.68, 1] as const;

export function ContactHero() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isMobile = useIsMobile();

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden pt-20"
      style={{
        backgroundColor: "#0E0D13",
        minHeight: "100vh",
      }}
    >
      {/* Shader background */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-60" style={{ zIndex: 0 }}>
          <LazyShader>
            <ContactShaders />
          </LazyShader>
        </div>
      )}

      {/* CSS gradient fallback */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          opacity: isMobile ? 0.72 : 0.4,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, #1B1233 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 70% 30%, #0B2842 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 80%, #1a0a2e 0%, transparent 50%)
          `,
        }}
      />


      {/* Content */}
      <div
        className="relative flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-7xl mx-auto px-6 md:px-14 py-16 md:py-24 lg:py-32"
        style={{ zIndex: 10 }}
      >
        {/* Left column: headline + intro */}
        <div className="flex-1 max-w-[520px]">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease }}
            className="text-vhs-yellow font-bold uppercase mb-6"
            style={{ fontSize: 12, letterSpacing: 3 }}
          >
            PLAY &bull; GET IN TOUCH
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-vhs-white font-light leading-[1.06] mb-6"
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
            }}
          >
            Let&apos;s build something{" "}
            <span className="text-vhs-yellow vhs-text-glow">
              worth rewinding.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="text-vhs-white-muted leading-relaxed mb-10"
            style={{ fontSize: 18, lineHeight: 1.6 }}
          >
            Have a project in mind, a question, or just want to say hello? Drop
            me a line and I&apos;ll get back to you as soon as I can.
          </motion.p>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="space-y-3"
          >
            <a
              href="mailto:joe@tekjoe.org"
              className="block font-mono text-xs tracking-[0.15em] text-vhs-gray hover:text-vhs-yellow transition-colors duration-300"
            >
              joe@tekjoe.org
            </a>
            <a
              href="https://github.com/tekjoe"
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-xs tracking-[0.15em] text-vhs-gray hover:text-vhs-yellow transition-colors duration-300"
            >
              github.com/tekjoe
            </a>
          </motion.div>
        </div>

        {/* Right column: form */}
        <div className="flex-1 max-w-[560px] w-full">
          <ContactForm />
        </div>
      </div>

      {/* Color band at bottom */}
      <div className="absolute bottom-0 left-0 right-0 vhs-color-band" />
    </section>
  );
}
