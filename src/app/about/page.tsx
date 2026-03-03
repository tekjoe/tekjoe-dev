// src/app/about/page.tsx
import type { Metadata } from "next";
import type { AllStats } from "@/types/stats";
import type {
  StatsResponse,
  GitHubStats,
  StravaStats,
} from "@/types/stats";
import { AboutHero } from "@/components/about/about-hero";
import { AboutSections } from "@/components/about/about-sections";

export const metadata: Metadata = {
  title: "About | Joe Ramirez — Creative Developer",
  description:
    "Creative developer with 8+ years crafting shader-rich interfaces, bold geometry, and handcrafted motion for the web.",
  openGraph: {
    title: "About | Joe Ramirez",
    description:
      "Creative developer with 8+ years crafting shader-rich interfaces and handcrafted motion — all engineered to perform at production scale.",
    type: "profile",
    images: [{ url: "/og-about.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Joe Ramirez",
    description:
      "Creative developer with 8+ years crafting shader-rich interfaces and handcrafted motion — all engineered to perform at production scale.",
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function fallback<T>(): StatsResponse<T> {
  return { data: null, lastUpdated: new Date().toISOString(), error: "Not loaded" };
}

async function fetchStats(): Promise<AllStats> {
  const [github, strava] = await Promise.allSettled([
    fetch(`${BASE_URL}/api/stats/github`, { next: { revalidate: 3600 } }).then(
      (r) => r.json() as Promise<StatsResponse<GitHubStats>>
    ),
    fetch(`${BASE_URL}/api/stats/strava`, { next: { revalidate: 3600 } }).then(
      (r) => r.json() as Promise<StatsResponse<StravaStats>>
    ),
  ]);

  return {
    github: github.status === "fulfilled" ? github.value : fallback<GitHubStats>(),
    strava: strava.status === "fulfilled" ? strava.value : fallback<StravaStats>(),
    whoop: fallback(),
  };
}

export default async function AboutPage() {
  const stats = await fetchStats();

  return (
    <div className="relative min-h-screen bg-vhs-bg pt-20">
      <AboutHero stats={stats} loading={false} />
      <AboutSections stats={stats} />
    </div>
  );
}
