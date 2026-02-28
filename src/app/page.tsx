import { Hero } from "@/components/sections/hero";
import { Work } from "@/components/sections/work";
import { About } from "@/components/sections/about";
import { ShowcaseCTA } from "@/components/sections/showcase-cta";
import { GlitchDivider } from "@/components/ui/glitch-divider";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="vhs-color-band w-full" />
      <Work />
      <GlitchDivider />
      <About />
      <ShowcaseCTA />
    </>
  );
}
