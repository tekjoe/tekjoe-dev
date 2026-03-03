export interface WorkProject {
  number: string;
  title: string;
  description: string;
  category: string;
  year: string;
  accentColor: string;
  link: string;
  url: string;
  image?: string;
}

export const workProjects: WorkProject[] = [
  {
    number: "01",
    title: "K9D8",
    description:
      "A modern web platform built with cutting-edge technologies and thoughtful design.",
    category: "DEVELOPMENT",
    year: "2026",
    accentColor: "#46157B",
    link: "k9d8.com",
    url: "https://www.k9d8.com",
    image: "/projects/k9d8.png",
  },
  {
    number: "02",
    title: "Bowel Buddies",
    description:
      "A playful, user-focused web application with a memorable brand and smooth experience.",
    category: "DEVELOPMENT",
    year: "2026",
    accentColor: "#10BBE4",
    link: "bowelbuddies.com",
    url: "https://bowelbuddies.com",
    image: "/projects/bowel-buddies.png",
  },
  {
    number: "03",
    title: "tekjoe.dev",
    description:
      "Personal portfolio site with a VHS-inspired aesthetic, Three.js scenes, and shader effects.",
    category: "CREATIVE",
    year: "2026",
    accentColor: "#E72026",
    link: "tekjoe.dev",
    url: "https://tekjoe.dev",
    image: "/projects/tekjoe.png",
  },
  {
    number: "04",
    title: "Community Smiles",
    description:
      "A community-focused nonprofit website designed to connect people with dental care resources.",
    category: "DEVELOPMENT",
    year: "2023",
    accentColor: "#B3C53B",
    link: "communitysmiles.org",
    url: "https://communitysmiles.org",
    image: "/projects/community-smiles.png",
  },
];
