export type Project = {
  t: string;
  src: string;
  site?: string;
  /** window captures, each with a -dark twin, in the order they cycle */
  shots: string[];
};

export const PROJECTS: Project[] = [
  {
    t: "Link All",
    src: "https://github.com/ChinmayyK/Link-All",
    site: "https://linkall.chinmaykudalkar.com",
    shots: ["linkall-mac-devices.png", "linkall-mac-clipboard.png", "linkall-mac-transfers-active.png", "linkall-win-clipboard.png"],
  },
];

export const TOOLS: [name: string, devicon: string][] = [
  ["TypeScript", "typescript"], ["JavaScript", "javascript"], ["Python", "python"], ["Rust", "rust"],
  ["Kotlin", "kotlin"], ["React", "react"], ["Next.js", "nextjs"], ["Node.js", "nodejs"],
  ["NestJS", "nestjs"], ["PostgreSQL", "postgresql"], ["MySQL", "mysql"], ["Redis", "redis"],
  ["Prisma", "prisma"], ["Docker", "docker"], ["Linux", "linux"], ["Git", "git"],
];

export const EMAIL = "chinmayy.kudalkar@gmail.com";

export const GITHUB = "ChinmayyK";

export const SOCIALS: [label: string, href: string][] = [
  ["GitHub", `https://github.com/${GITHUB}`],
  ["LinkedIn", "https://linkedin.com/in/chinmayyk"],
  ["Résumé", "/resume"],
];

export type Role = { role: string; org: string; when: string; line: string; now?: boolean };

export const EXPERIENCE: Role[] = [
  { role: "Web & Mobile App Developer Intern", org: "ideaForge", when: "Aug 2026 — now", now: true,
    line: "iF FleetDesk: booking, dispatch and live vehicle tracking for staff, on web and mobile." },
  { role: "Software Engineering Intern", org: "Mintskill HR Solutions", when: "Dec 2025 — Apr 2026",
    line: "Node.js services that connect hiring tools to CRMs." },
];


export const EDUCATION = { school: "RT-MSSU", degree: "B.Tech, Computer Technology", when: "2023 — 2027" };
