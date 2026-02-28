"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { projects, type Project } from "@/data/projects";

function TapeSpineCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, x: -60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="group"
    >
      <a
        href={project.link || "#"}
        className="flex items-stretch border border-border hover:border-vhs-yellow/40 transition-all duration-500 bg-vhs-dark/50 hover:bg-vhs-dark"
      >
        {/* Colored spine edge */}
        <div
          className="w-2 md:w-3 flex-shrink-0 transition-all duration-500 group-hover:w-4 md:group-hover:w-6"
          style={{ backgroundColor: project.color }}
        />

        {/* Content */}
        <div className="flex-1 px-6 md:px-8 py-6 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: project.color }}
              >
                {project.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-vhs-gray" />
              <span className="font-mono text-xs text-vhs-gray">
                {project.year}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-vhs-white group-hover:text-vhs-yellow transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-vhs-gray text-sm md:text-base mt-2 max-w-xl leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500">
              {project.description}
            </p>
          </div>

          {/* Arrow */}
          <motion.div
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-border group-hover:border-vhs-yellow group-hover:bg-vhs-yellow transition-all duration-300"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-vhs-gray group-hover:text-vhs-bg transition-colors duration-300"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </motion.div>
        </div>
      </a>
    </motion.article>
  );
}

export function Work() {
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section id="work" className="relative bg-vhs-bg section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div ref={titleRef} className="mb-12 md:mb-16">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
            className="h-0.5 bg-vhs-yellow mb-8 origin-left max-w-[80px]"
          />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-vhs-white"
            >
              Selected
              <br />
              <span className="text-vhs-yellow">Work</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-vhs-gray max-w-sm text-sm md:text-base leading-relaxed"
            >
              A selection of projects built for clients and personal exploration
              across design, development, and creative technology.
            </motion.p>
          </div>
        </div>

        {/* Tape spine cards */}
        <div className="flex flex-col gap-3">
          {projects.map((project, index) => (
            <TapeSpineCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
