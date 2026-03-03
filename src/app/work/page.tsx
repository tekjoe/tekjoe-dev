import { WorkHero } from "@/components/work/work-hero";
import { ProjectLedger } from "@/components/work/project-ledger";
import { BuildProcess } from "@/components/work/build-process";
import { OutcomesStrip } from "@/components/work/outcomes-strip";
import { TapeMetadata } from "@/components/work/tape-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work | tekjoe",
  description:
    "Selected projects and build process. Shader-rich interfaces, bold geometry, and handcrafted motion — all engineered to perform at production scale.",
  openGraph: {
    title: "Work | tekjoe",
    description:
      "Selected projects and build process. Shader-rich interfaces, bold geometry, and handcrafted motion — all engineered to perform at production scale.",
    type: "website",
    images: [{ url: "/og-work.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work | tekjoe",
    description:
      "Selected projects and build process. Shader-rich interfaces, bold geometry, and handcrafted motion — all engineered to perform at production scale.",
    images: ["/og-work.png"],
  },
};

export default function WorkPage() {
  return (
    <>
      <WorkHero />
      <ProjectLedger />
      <BuildProcess />
      <OutcomesStrip />
      <TapeMetadata />
    </>
  );
}
