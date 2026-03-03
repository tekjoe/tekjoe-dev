// src/components/three/tape-labels/bio-label.tsx
export function BioLabel() {
  return (
    <div
      className="w-[280px] h-[420px] relative select-none overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* Black top with format badge */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: "140px", background: "#000000" }}
      >
        <span className="text-[80px] font-black text-white tracking-tight leading-none">
          T-120
        </span>
      </div>

      {/* Color bands — yellow dominant */}
      <div className="absolute left-0 right-0" style={{ top: "140px" }}>
        <div style={{ height: "22px", background: "#FED801" }} />
        <div style={{ height: "26px", background: "#E8258F" }} />
        <div style={{ height: "22px", background: "#eb2635" }} />
        <div style={{ height: "26px", background: "#fd8010" }} />
      </div>

      {/* Light gray lower */}
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-start justify-center px-5"
        style={{ top: "236px", background: "#efefef" }}
      >
        <span className="text-[22px] font-black text-black leading-tight tracking-tight">
          JOE RAMIREZ
        </span>
        <span className="text-[11px] font-bold text-black/50 uppercase tracking-[0.2em] mt-1">
          Creative Developer
        </span>
      </div>

      {/* Arrow tab */}
      <svg
        className="absolute"
        style={{ right: "0", top: "250px" }}
        width="60"
        height="100"
        viewBox="0 0 60 100"
      >
        <polygon points="60,0 0,50 60,100" fill="#3f3f3f" />
      </svg>

      {/* VHS logo */}
      <div
        className="absolute bottom-[14px] left-[10px] bg-white px-[6px] py-[3px]"
        style={{ border: "2px solid black" }}
      >
        <span
          className="text-[14px] font-semibold text-black"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          VHS
        </span>
      </div>
    </div>
  );
}
