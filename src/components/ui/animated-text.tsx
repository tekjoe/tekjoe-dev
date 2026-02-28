"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { staggerContainer, characterAnimation, wordAnimation } from "@/lib/animations";

interface AnimatedTextProps {
  text: string;
  className?: string;
  type?: "chars" | "words";
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
}

export function AnimatedText({
  text,
  className = "",
  type = "chars",
  as: Tag = "span",
  delay = 0,
}: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const items = type === "chars" ? text.split("") : text.split(" ");

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      <motion.span
        className="inline-flex flex-wrap overflow-hidden"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{ perspective: "1000px" }}
      >
        {items.map((item, i) => (
          <motion.span
            key={i}
            variants={type === "chars" ? characterAnimation : wordAnimation}
            className="inline-block"
            style={{
              transformStyle: "preserve-3d",
              transitionDelay: `${delay + i * 0.03}s`,
            }}
          >
            {item === " " ? "\u00A0" : item}
            {type === "words" && i < items.length - 1 && "\u00A0"}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function RevealText({ children, className = "", delay = 0 }: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : {}}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
