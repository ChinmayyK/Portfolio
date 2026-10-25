import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif" });

export const metadata: Metadata = {
  metadataBase: new URL("https://chinmaykudalkar.com"),
  title: "Chinmay Kudalkar",
  description: "Chinmay Kudalkar, full-stack developer. Projects, experience and contact.",
  openGraph: {
    title: "Chinmay Kudalkar",
    description: "Full-stack developer. Projects, experience and contact.",
    url: "https://chinmaykudalkar.com",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F4F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0C" },
  ],
};

// Runs before paint: marks JS as available and applies the saved or system theme,
// so the page never flashes the wrong colours.
const THEME_BOOT = `(function(){var d=document.documentElement;d.classList.add("js");var t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";d.dataset.theme=t})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
