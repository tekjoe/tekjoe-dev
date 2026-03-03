"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { workProjects } from "@/data/work-projects";

const ease = [0.33, 1, 0.68, 1] as const;

export function ProjectLedger() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="projects"
      ref={ref}
      className="relative overflow-hidden"
      style={{ backgroundColor: "#0A0A0F" }}
    >
      <div className="relative z-10 py-20 px-6 md:px-14 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col gap-4 mb-16"
        >
          <span
            className="text-vhs-yellow font-bold uppercase"
            style={{ fontSize: 12, letterSpacing: 3 }}
          >
            Featured Projects &bull; Selected Reels
          </span>
          <h2
            className="text-white font-light"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.125rem)",
              lineHeight: 1.08,
            }}
          >
            Real work. Real results.
          </h2>
          <p
            className="text-white/70 max-w-xl"
            style={{ fontSize: 18, lineHeight: 1.6 }}
          >
            From bold brand sites to data-rich platforms — here&apos;s what
            shipped.
          </p>
        </motion.div>

        {/* Projects */}
        <div className="flex flex-col gap-16">
          {workProjects.map((project, index) => {
            const imageFirst = index % 2 === 0;

            return (
              <div key={project.number}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + index * 0.1,
                    ease,
                  }}
                  className={`flex flex-col ${
                    imageFirst ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center gap-8 md:gap-12`}
                >
                  {/* Screenshot */}
                  <div className="w-full md:w-1/2">
                    {project.image ? (
                      <div className="relative aspect-[680/440] rounded overflow-hidden border border-white/[0.07]">
                        <Image
                          src={project.image}
                          alt={`${project.title} screenshot`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-[680/440] rounded border border-white/[0.07]"
                        style={{
                          background: `linear-gradient(135deg, ${project.accentColor}18 0%, rgba(255,255,255,0.03) 100%)`,
                        }}
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="w-full md:w-1/2 flex flex-col gap-5">
                    <span
                      className="font-extrabold opacity-50 leading-none"
                      style={{
                        fontSize: "clamp(3rem, 6vw, 4.5rem)",
                        letterSpacing: -2,
                        color: project.accentColor,
                      }}
                    >
                      {project.number}
                    </span>

                    <div className="flex items-center gap-4">
                      <span
                        className="text-vhs-gray font-semibold uppercase"
                        style={{ fontSize: 11, letterSpacing: 2 }}
                      >
                        {project.category}
                      </span>
                      <span
                        className="text-vhs-gray"
                        style={{ fontSize: 11 }}
                      >
                        &bull;
                      </span>
                      <span
                        className="font-bold uppercase"
                        style={{
                          fontSize: 11,
                          letterSpacing: 2,
                          color: project.accentColor,
                        }}
                      >
                        {project.year}
                      </span>
                    </div>

                    <h3
                      className="text-white text-2xl md:text-4xl font-bold"
                      style={{ letterSpacing: -0.5 }}
                    >
                      {project.title}
                    </h3>

                    <p
                      className="text-white/70"
                      style={{ fontSize: 16, lineHeight: 1.6 }}
                    >
                      {project.description}
                    </p>

                    <div
                      className="h-[3px] w-12"
                      style={{ backgroundColor: project.accentColor }}
                    />

                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vhs-gray font-semibold hover:text-white transition-colors"
                      style={{ fontSize: 12, letterSpacing: 1 }}
                    >
                      {project.link} →
                    </a>
                  </div>
                </motion.div>

                {/* Divider */}
                {index < workProjects.length - 1 && (
                  <div className="h-px bg-white/[0.06] mt-16" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
