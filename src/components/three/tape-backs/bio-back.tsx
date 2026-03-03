// src/components/three/tape-backs/bio-back.tsx
export function BioBack() {
  return (
    <div
      className="w-[280px] h-[420px] text-white relative flex flex-col overflow-hidden select-none"
      style={{
        background: "#1a1a1a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Accent header */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: "40px", background: "#FED801" }}
      >
        <span className="text-[18px] font-black text-black tracking-tight leading-none">
          BIO
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        <div className="mb-3">
          <p className="text-[16px] font-bold text-white leading-tight">
            Joe Ramirez
          </p>
          <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mt-0.5">
            Creative Developer
          </p>
          <p className="text-[9px] text-white/40 mt-0.5">Madison, WI</p>
        </div>

        <p className="text-[9px] text-white/60 leading-relaxed mb-3">
          8+ years building for the web. Crafting interfaces that feel as good as
          they look — shader-rich, bold geometry, handcrafted motion.
        </p>

        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between items-baseline">
            <span className="text-[8px] uppercase tracking-widest text-white/40">
              Experience
            </span>
            <span className="font-mono text-[10px] text-white/80">8+ years</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[8px] uppercase tracking-widest text-white/40">
              Projects
            </span>
            <span className="font-mono text-[10px] text-white/80">50+</span>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <a
            href="https://github.com/tekjoe"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[8px] tracking-wider text-[#FED801] hover:underline"
          >
            github.com/tekjoe
          </a>
          <a
            href="https://linkedin.com/in/tekjoe"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[8px] tracking-wider text-[#FED801] hover:underline"
          >
            linkedin.com/in/tekjoe
          </a>
        </div>

        <div className="mt-auto pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] text-white/50 uppercase tracking-widest">
              Available for projects
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
