import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { ClientLayoutEffects } from "@/components/ClientLayoutEffects";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false, // secondary font — defer
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chinmaykudalkar.com"),
  title: "Chinmay Kudalkar | Full-Stack Engineer | Systems & AI",
  description:
    "Portfolio of Chinmay Kudalkar, a full-stack engineer building multi-tenant SaaS systems and AI-powered products from Navi Mumbai.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.chinmaykudalkar.com",
    siteName: "Chinmay Kudalkar",
    title: "Chinmay Kudalkar | Full-Stack Engineer",
    description: "Building scalable systems and elegant user interfaces.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Chinmay Kudalkar Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chinmay Kudalkar | Full-Stack Engineer",
    description: "Building scalable systems and elegant user interfaces.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const themeBootScript = `
  (() => {
    try {
      const key = "portfolio-theme";
      const saved = window.localStorage.getItem(key);
      const theme =
        saved === "light" || saved === "dark"
          ? saved
          : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (_error) {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

// Primes the Web Audio context on the very first user gesture so
// iOS haptic feedback works from that point on (AudioContext requires
// a user activation before it can be started/resumed).
const hapticPrimerScript = `
  (function() {
    function prime() {
      try {
        var Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return;
        var ctx = new Ctor();
        if (ctx.state === 'suspended') ctx.resume();
        // Store so haptics.ts can reuse it
        window.__hapticAudioCtx = ctx;
      } catch(_) {}
      document.removeEventListener('touchstart', prime, true);
      document.removeEventListener('click', prime, true);
    }
    document.addEventListener('touchstart', prime, { once: true, capture: true, passive: true });
    document.addEventListener('click', prime, { once: true, capture: true });
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {/* Preconnect to font origins to cut connection latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${plexMono.variable} min-h-screen antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: hapticPrimerScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Chinmay Kudalkar",
              "url": "https://www.chinmaykudalkar.com",
              "jobTitle": "Full-Stack Engineer",
              "description": "Building scalable systems and elegant user interfaces.",
              "sameAs": [
                "https://github.com/ChinmayyK",
                "https://www.linkedin.com/in/chinmayyk/"
              ]
            })
          }}
        />
        <ClientLayoutEffects>
          {children}
        </ClientLayoutEffects>
      </body>
    </html>
  );
}
