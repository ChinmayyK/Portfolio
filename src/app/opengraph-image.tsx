import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Host Grotesk (SIL OFL, see src/assets/fonts/OFL.txt), so the share card matches the site.
const font = readFileSync(join(process.cwd(), "src/assets/fonts/HostGrotesk-Regular.ttf"));

// Rendered once at build time: the hero's name, with the inspector lens resting over it.
export const dynamic = "force-static";
export const alt = "Chinmay Kudalkar, software engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#EFEEEA", INK = "#141413", GREY = "#6B6A66", LIME = "#D4F25A";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: PAPER, color: INK, padding: "56px 64px", fontFamily: "Host Grotesk", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26 }}>
          <span>Chinmay Kudalkar</span>
          <span style={{ color: GREY }}>Software engineer · Mumbai</span>
        </div>
        <div style={{ position: "absolute", left: 560, top: 250, width: 300, height: 300, borderRadius: 300, background: LIME, display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 196, lineHeight: 0.92, letterSpacing: -10, position: "relative" }}>
          <span>Chinmay</span>
          <span style={{ paddingLeft: 170 }}>Kudalkar</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Host Grotesk", data: font, weight: 400, style: "normal" }] },
  );
}
