export type Project = {
  k: string;
  t: string;
  line: string;
  lede: string;
  pts: string[];
  stack: string;
  src: string;
  site?: string;
  img: string;
  /** object-position for the card image, when the top-left crop misses the interesting part */
  pos?: string;
  /** background behind the card image, to match dark screenshots */
  tone?: string;
  shots: string[];
};

export const PROJECTS: Project[] = [
  {
    k: "Rust, Swift, Kotlin, WinUI 3",
    t: "Link All",
    line: "Copy on one device, paste on another. Clipboard and files across macOS, Windows, Android and Linux, with no cloud.",
    lede: "A local-first app with one Rust core and a native app on each platform. Everything stays on your own network, end-to-end encrypted, with no account. macOS, Android and Linux are stable; Windows is in alpha.",
    pts: [
      "File transfers that resume after a dropped connection, using chunk-level acknowledgements.",
      "A shared clipboard history, with a filter that keeps OTPs, passwords and card numbers from syncing.",
      "X25519 key exchange and ChaCha20-Poly1305 encryption. Pairing is confirmed with a matching code or a QR code.",
      "Notification mirroring, remote file browsing and a wireless camera, on the same encrypted connection.",
      "Its website, built with Next.js and deployed on Cloudflare.",
    ],
    stack: "Rust, Swift and SwiftUI, Kotlin and Jetpack Compose, WinUI 3, GTK, Next.js",
    src: "https://github.com/ChinmayyK/Link-All",
    site: "https://linkall.chinmaykudalkar.com",
    img: "linkall-mac-devices.png",
    shots: ["linkall-mac-devices.png", "linkall-mac-clipboard.png", "linkall-mac-transfers-active.png", "linkall-mac-command-palette.png", "linkall-win-clipboard.png"],
  },
  {
    k: "Next.js, NestJS, PostgreSQL",
    t: "Lineup",
    line: "A multi-tenant interview platform.",
    lede: "Companies schedule interviews and track candidates, with each tenant's data kept separate.",
    pts: [
      "Multi-tenant backend with row-level isolation and JWT authentication.",
      "Reporting and caching with Redis.",
      "An OCR ingestion pipeline that processes 1,000+ candidate records per upload.",
    ],
    stack: "Next.js, NestJS, PostgreSQL, Redis, JWT",
    src: "https://github.com/ChinmayyK/TalentSync",
    img: "lineup-candidates.png",
    shots: ["lineup-dashboard.png", "lineup-candidates.png", "lineup-reports.png"],
  },
  {
    k: "Encryption, IPFS",
    t: "BlockVault",
    line: "An encrypted document vault.",
    lede: "Documents are encrypted on the client, and sharing rules are checked with zero-knowledge proofs. Files are stored on IPFS.",
    pts: [
      "Client-side encryption before upload.",
      "Zero-knowledge proofs for server-side rule checks.",
      "A redaction tool for removing sensitive parts of a document.",
    ],
    stack: "Zero-knowledge proofs, IPFS",
    src: "https://github.com/ChinmayyK/BlockVault",
    img: "doc-redact-engine.png",
    pos: "62% 0",
    tone: "#0B0B0C",
    shots: ["doc-redact-engine.png", "bv2.png", "bv1.png"],
  },
];

export const TOOLS: [name: string, devicon: string][] = [
  ["TypeScript", "typescript"], ["JavaScript", "javascript"], ["Python", "python"], ["Rust", "rust"],
  ["Kotlin", "kotlin"], ["React", "react"], ["Next.js", "nextjs"], ["Node.js", "nodejs"],
  ["NestJS", "nestjs"], ["PostgreSQL", "postgresql"], ["MySQL", "mysql"], ["Redis", "redis"],
  ["Prisma", "prisma"], ["Docker", "docker"], ["Linux", "linux"], ["Git", "git"],
];

export const EMAIL = "chinmayy.kudalkar@gmail.com";
