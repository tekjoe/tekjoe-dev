"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-is-mobile";

interface LazyShaderProps {
  children: ReactNode;
  /** CSS class for the fallback gradient shown when shader is unmounted */
  fallbackClass?: string;
  /** Viewport margin for mounting earlier (e.g. "200px") */
  rootMargin?: string;
}

/**
 * Mounts children (shader components) only when visible in viewport.
 * Unmounts when scrolled away to free GPU resources.
 * Shows nothing (or a CSS fallback) when prefers-reduced-motion is set.
 */
export function LazyShader({
  children,
  fallbackClass = "",
  rootMargin = "200px",
}: LazyShaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  // If user prefers reduced motion, show a static fallback
  if (prefersReduced) {
    return <div ref={ref} className={`w-full h-full ${fallbackClass}`} />;
  }

  return (
    <div ref={ref} className="w-full h-full">
      {isVisible ? children : null}
    </div>
  );
}
