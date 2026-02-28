export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  color: string;
  description: string;
  link?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "K9D8",
    category: "Development",
    year: "2026",
    color: "#46157B",
    description:
      "A modern web platform built with cutting-edge technologies and thoughtful design.",
    link: "https://www.k9d8.com",
  },
  {
    id: "2",
    title: "Bowel Buddies",
    category: "Development",
    year: "2026",
    color: "#10BBE4",
    description:
      "A playful, user-focused web application with a memorable brand and smooth experience.",
    link: "https://www.bowelbuddies.com",
  },
  {
    id: "3",
    title: "tekjoe.dev",
    category: "Creative",
    year: "2026",
    color: "#E72026",
    description:
      "Personal portfolio site with a VHS-inspired aesthetic, Three.js scenes, and shader effects.",
    link: "https://tekjoe.dev",
  },
  {
    id: "4",
    title: "Community Smiles",
    category: "Development",
    year: "2023",
    color: "#B3C53B",
    description:
      "A community-focused nonprofit website designed to connect people with dental care resources.",
    link: "https://www.communitysmiles.org",
  },
];
