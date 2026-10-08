import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://chinmaykudalkar.com"),
  title: "Chinmay Kudalkar",
  description: "Chinmay Kudalkar, web and mobile developer. Projects, experience and contact.",
  openGraph: {
    title: "Chinmay Kudalkar",
    description: "Web and mobile developer. Projects, experience and contact.",
    url: "https://chinmaykudalkar.com",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#ECEDEF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Hide reveal-on-scroll content only when JS runs, so the page still reads without it. */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
