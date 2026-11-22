// Everything about the person, in one place. Facts here come from the résumé and the live site.

export const SITE = {
  name: "Chinmay Kudalkar",
  url: "https://chinmaykudalkar.com",
  role: "Software engineer",
  city: "Mumbai",
  timeZone: "Asia/Kolkata",
  status: "Interning at ideaForge. Open to full-time roles from 2027.",
  description:
    "Chinmay Kudalkar, software engineer. Cross-platform apps, developer tools and production systems: Link All, iF FleetDesk and more.",
  email: "chinmayy.kudalkar@gmail.com",
  github: "https://github.com/ChinmayyK",
  linkedin: "https://linkedin.com/in/chinmayyk",
  resume: "/resume",
} as const;

export const NAV = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export type Role = { org: string; role: string; when: string; line: string };

export const EXPERIENCE: Role[] = [
  {
    org: "ideaForge",
    role: "Web & Mobile App Developer Intern",
    when: "Aug 2026 – now",
    line: "Building iF FleetDesk, the company's fleet and employee-transport platform, on web and mobile.",
  },
  {
    org: "Mintskill HR Solutions",
    role: "Software Engineering Intern",
    when: "Dec 2025 – Apr 2026",
    line: "Node.js services and integrations that connect hiring tools to CRMs. Led a small intern team.",
  },
];

export const EDUCATION = {
  school: "Ratan Tata Maharashtra State Skills University",
  degree: "B.Tech, Computer Technology",
  when: "2023 – 2027",
};

export const CAPABILITIES: [group: string, items: string[]][] = [
  ["Languages", ["TypeScript", "Rust", "Swift", "Kotlin", "Python", "C#", "SQL"]],
  ["Backend", ["Node.js", "NestJS", "Prisma", "REST", "WebSockets", "BullMQ"]],
  ["Interfaces", ["React", "Next.js", "React Native", "SwiftUI", "Jetpack Compose", "WinUI 3"]],
  ["Data & ops", ["PostgreSQL", "Redis", "Docker", "GitHub Actions", "Linux", "Sentry"]],
];
