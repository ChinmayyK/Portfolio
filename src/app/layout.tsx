import type { Metadata, Viewport } from "next";
import { Host_Grotesk } from "next/font/google";
import { SITE } from "@/content/site";
import Chrome from "@/components/chrome/Chrome";
import "./globals.css";

// Host Grotesk at regular weight carries the whole site; size and spacing do the work, not boldness.
const host = Host_Grotesk({ subsets: ["latin"], variable: "--font-host", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Software engineer`, template: `%s — ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#efeeea", colorScheme: "light" };

// Runs before paint. Marks JS as present so reveals can start hidden; if motion never initialises
// (a script error, a very slow network), the class comes off after 4s and everything shows.
const BOOT = `(function(){var d=document.documentElement;d.classList.add("js");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.remove("js")},4000)})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={host.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
