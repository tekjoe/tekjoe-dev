"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";


function PlayheadTimecode() {
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
    const id = setInterval(update, 42);
    return () => clearInterval(id);
  }, []);

  return <>PLAYHEAD {time}</>;
}

export function TapeMetadata() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ backgroundColor: "#07070A" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 py-14 flex flex-col gap-9"
      >
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span
            className="text-vhs-white-muted font-bold uppercase"
            style={{ fontSize: 12, letterSpacing: 3 }}
          >
            TEKJOE &bull; VHS WORK PAGE
          </span>
          <span
            className="text-vhs-yellow font-bold uppercase tabular-nums"
            style={{ fontSize: 12, letterSpacing: 3 }}
          >
            <PlayheadTimecode />
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10" />

        {/* Bottom text */}
        <p className="text-vhs-gray" style={{ fontSize: 15 }}>
          Open for product, brand, and interactive web collaborations.
        </p>
      </motion.div>
    </section>
  );
}
