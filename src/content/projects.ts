// Project and case-study content. Every claim here is drawn from the Link All README and the résumé.
// Nothing about FleetDesk goes beyond what the résumé already says in public.

export type Block = { title: string; body: string };
export type Decision = Block & { tradeoff: string };
export type Shot = { src: string; alt: string; w: number; h: number };

export type Project = {
  slug: "link-all" | "fleetdesk";
  index: string;
  title: string;
  kind: "Personal project" | "Professional work";
  context: string;
  years: string;
  summary: string;
  platforms: string[];
  stack: string[];
  role: string;
  /** one or two words for the work index */
  category: string;
  notice?: string;
  links: { label: string; href: string }[];
  problem: string[];
  architecture: { intro: string; notes: Block[] };
  challenges: Block[];
  decisions: Decision[];
  lessons: Block[];
  outcomes: string[];
};

const img = (src: string, alt: string, w: number, h: number): Shot => ({ src: `/img/${src}.webp`, alt, w, h });

export const SHOTS = {
  macDevices: img("linkall-mac-devices", "Link All on macOS: a paired phone's battery, storage and quick actions", 1280, 845),
  macTransfers: img("linkall-mac-transfers", "Link All on macOS: a file transfer in progress", 1280, 845),
  winClipboard: img("linkall-win-clipboard", "Link All on Windows: shared clipboard history", 1280, 750),
  linuxDevices: img("linkall-linux-devices", "Link All on Linux: this computer, send actions and paired devices", 1026, 762),
  androidHome: img("linkall-android-home", "Link All on Android: home, with the phone linked to three devices", 640, 1431),
  androidDevices: img("linkall-android-devices", "Link All on Android: a paired computer's page", 640, 1431),
  streamdisk: img("streamdisk-welcome", "StreamDisk's welcome window on macOS", 1280, 1408),
} satisfies Record<string, Shot>;

export const PROJECTS: Project[] = [
  {
    slug: "link-all",
    index: "01",
    title: "Link All",
    kind: "Personal project",
    category: "Cross-platform app",
    context: "Solo, open source",
    years: "2026 – now",
    summary: "Phones and computers that work as one, over your own network, with no cloud.",
    platforms: ["Android", "macOS", "Windows", "Linux"],
    stack: ["Rust", "Swift · SwiftUI", "Kotlin · Jetpack Compose", "C# · WinUI 3", "GTK 4 · libadwaita"],
    role: "Designed and built alone: the protocol, the Rust core, all four native apps, packaging and store releases.",
    links: [
      { label: "Website", href: "https://linkall.chinmaykudalkar.com" },
      { label: "Microsoft Store", href: "https://apps.microsoft.com/detail/9P9DJW3KCK9K" },
      { label: "Source", href: "https://github.com/ChinmayyK/Link-All" },
    ],
    problem: [
      "A phone and a laptop on the same desk share very little unless both come from the same company. The tools that bridge them tend to cover only some systems, route through a cloud, or stop at sending files.",
      "Link All does the everyday things across Android, macOS, Windows and Linux: files, clipboard, notifications and calls, media, notes, and the phone as a remote or keyboard. Everything stays on the local network, with no account.",
    ],
    architecture: {
      intro: "One Rust core does the networking, encryption and transfer work. Each platform gets a native app that talks to it through the binding that suits that platform.",
      notes: [
        { title: "Discovery", body: "Devices announce themselves over mDNS with anonymous IDs. Friendly names are only shared after pairing." },
        { title: "Session", body: "X25519 key exchange, HKDF-SHA256 key derivation and AES-256-GCM. Every frame carries an increasing counter, so replayed frames are rejected." },
        { title: "Transfer", body: "Files stream in chunks that the receiver acknowledges. Buffers are shared rather than copied, and files that won't compress skip compression." },
      ],
    },
    challenges: [
      { title: "Transfers that survive a dropped connection", body: "Wi-Fi drops, laptops sleep, phones change networks. A transfer that breaks picks up from the last chunk the other side confirmed. How much is in flight grows or shrinks with how quickly acknowledgements come back, and the computer is kept awake while a transfer runs." },
      { title: "Trust on a shared network", body: "Seeing a device on the network says nothing about who owns it. Pairing shows the same security code on both screens, derived from the encrypted session, so a device in the middle would show a different one. Secret keys are wiped from memory once they're used." },
      { title: "A clipboard that doesn't leak", body: "A synced clipboard can carry a password across the room. Items are checked on the device before they're sent, so passwords, one-time codes, API keys and card numbers can be kept from leaving it." },
      { title: "Four platforms, one behaviour", body: "Each system has its own rules for background work, notifications and packaging. The core owns behaviour and the apps own presentation, so a pairing request ends the same way on both sides: accepted, declined, withdrawn or expired." },
    ],
    decisions: [
      { title: "A Rust core with native apps", body: "Rather than one cross-platform interface toolkit, each system gets an app written in its own native framework.", tradeoff: "Four interfaces to build and keep in step, in return for apps that feel at home on each system and one place for the hard logic." },
      { title: "Local network only", body: "No accounts, no relay, nothing stored on a server.", tradeoff: "Devices have to share a network. When they don't, there is nothing to fall back on, by design." },
      { title: "Guest Drop in the browser", body: "Someone who isn't paired can send files from any browser with a QR code and a PIN.", tradeoff: "Nothing to install for the guest, but the page isn't encrypted. So it lasts five minutes, five wrong PINs end it, and nothing is remembered." },
    ],
    lessons: [
      { title: "Reliability before features", body: "After the first store release I held back new features until the existing ones were dependable. Pairing, reconnects and long transfers got most of that work." },
      { title: "Measure the build people run", body: "Android debug builds looked far slower than they were. Profiling the release build during a real transfer showed where the actual problems were." },
    ],
    outcomes: [
      "Available on the Microsoft Store.",
      "Released on GitHub for all four platforms, and through Homebrew.",
      "The Android app is in closed testing on Google Play.",
      "Open source, with the full history on GitHub.",
    ],
  },
  {
    slug: "fleetdesk",
    index: "02",
    title: "iF FleetDesk",
    kind: "Professional work",
    category: "Fleet platform",
    context: "Internship at ideaForge",
    years: "Aug 2026 – now",
    summary: "Booking, dispatch and live tracking for a company's vehicles, on web and phones.",
    platforms: ["Web", "Android", "iOS"],
    stack: ["TypeScript", "NestJS", "PostgreSQL · Prisma", "React", "React Native · Expo", "Socket.IO · Redis", "BullMQ"],
    role: "Sole developer, end to end: the API, the web app, the mobile apps, deployment and operations.",
    notice: "FleetDesk is internal to ideaForge. This page stays at the level of detail on my résumé: no screenshots, data or internal specifics. The visuals are illustrations, not the product.",
    links: [],
    problem: [
      "Staff transport and vehicle bookings ran through coordinators, by hand.",
      "FleetDesk replaces that with one system: employees book trips, admins approve and dispatch them, and drivers run them from their phones while the fleet shows live on a map.",
    ],
    architecture: {
      intro: "One TypeScript monorepo holds the API, the web app and the mobile apps, with domain types shared between them.",
      notes: [
        { title: "API", body: "NestJS with PostgreSQL through Prisma. Approval rules, dispatch and trips live here." },
        { title: "Live map", body: "Socket.IO, backed by Redis, carries vehicle positions to the people watching them." },
        { title: "Background work", body: "BullMQ queues retry push notifications until they're delivered." },
      ],
    },
    challenges: [
      { title: "Dispatch under concurrency", body: "Two admins must never give the same vehicle or driver to overlapping trips. Dispatch takes PostgreSQL row locks in a fixed order, which also rules out deadlocks, and its tests run against a real database." },
      { title: "Drivers without signal", body: "Drivers lose network on the road. Location updates queue on the phone and replay safely once it reconnects, and closing a trip survives a dropped connection." },
      { title: "Bookings with real rules", body: "A booking can carry passengers or material, several stops, and a local or outstation trip. Approval depends on the site and the trip type, and shuttles take seat reservations." },
      { title: "Sign-in for staff and drivers", body: "Email one-time codes for staff and PINs for drivers, with tokens and refresh sessions per device, rate limiting, and code, secret and container scanning in CI." },
    ],
    decisions: [
      { title: "Locks in the database", body: "Vehicle and driver assignment is guarded by PostgreSQL row locks, not by application state.", tradeoff: "It stays correct however many API instances run, at the cost of careful lock ordering and tests that need a real database." },
      { title: "A driver app that works offline", body: "The phone is the source of truth while a trip is running.", tradeoff: "Trips keep going on bad networks, but the server has to accept late, replayed updates safely." },
      { title: "One monorepo, shared types", body: "The API and both clients build from the same domain package.", tradeoff: "A domain change reaches every app at once and type errors surface at build time; in exchange, mobile releases have to keep pace, so old app versions can be made to update." },
    ],
    lessons: [
      { title: "Operations are part of the product", body: "Docker behind Nginx, monitoring and alerts with Prometheus, Grafana and Loki, backups that were actually restored, and a checked import of the old system's data. A new internal tool earns trust through this as much as through its screens." },
    ],
    outcomes: [
      "Replaces a manual, coordinator-driven process.",
      "The legacy system's data was imported and checked.",
      "Usage figures are internal to ideaForge and not published here.",
    ],
  },
];

export const ALSO = [
  {
    title: "StreamDisk",
    category: "macOS app",
    kind: "Personal project · in progress",
    years: "2026 – now",
    line: "A native macOS app that mounts Google Drive in Finder and streams files on demand, through its own NFSv3 server written in Swift.",
    href: "https://github.com/ChinmayyK/StreamDisk",
  },
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
