export type Project = {
  k: string;
  t: string;
  line: string;
  lede: string;
  pts: string[];
  stack: string;
  src: string;
  site?: string;
  /** the one project that gets its own chapter instead of a deck card */
  star?: boolean;
  /** screens in the order the deck card steps through them; the first is shown by default */
  shots: string[];
};

export const PROJECTS: Project[] = [
  {
    k: "Rust, Swift, Kotlin, WinUI 3",
    t: "Link All",
    star: true,
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

/** Natural pixel sizes, so images reserve their space and never need cropping. */
export const IMG_SIZE: Record<string, [number, number]> = {
  "bv1.png": [1909, 997], "bv2.png": [1906, 996], "doc-redact-engine.png": [1907, 997],
  "lineup-candidates.png": [1919, 999], "lineup-dashboard.png": [1920, 999], "lineup-reports.png": [1919, 1000],
  "linkall-android-home.png": [1240, 2772], "linkall-mac-clipboard.png": [2400, 1584], "linkall-mac-command-palette.png": [1200, 1244],
  "linkall-mac-devices.png": [2400, 1584], "linkall-mac-transfers-active.png": [2400, 1584], "linkall-win-clipboard.png": [1572, 921],
  "chinmay-photo.png": [750, 1000],
};
// Link All ships light and dark captures; the -dark files share their light twin's size.
for (const f of ["linkall-android-home.png", "linkall-mac-clipboard.png", "linkall-mac-command-palette.png", "linkall-mac-devices.png", "linkall-mac-transfers-active.png", "linkall-win-clipboard.png"]) {
  IMG_SIZE[f.replace(/.png$/, "-dark.png")] = IMG_SIZE[f];
}

export const hasDark = (file: string) => !file.endsWith("-dark.png") && file.replace(/.png$/, "-dark.png") in IMG_SIZE;

export const imgProps = (file: string) => {
  const [width, height] = IMG_SIZE[file] ?? [];
  return { src: `/img/${file}`, width, height };
};
