import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Geist (SIL OFL, see src/assets/fonts/OFL.txt), so the image matches the site's type.
const font = (file: string) => readFileSync(join(process.cwd(), "src/assets/fonts", file));

// Home-screen icon for iOS: the same CK monogram (with its ghosted 11) as icon.svg, as a PNG.
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Geist", alignItems: "center", justifyContent: "center", background: "#0E0F12", color: "#F9F9FA", fontWeight: 700 }}>
        {/* a ghosted 11 behind the monogram */}
        <div style={{ position: "absolute", display: "flex", fontSize: 194, letterSpacing: -16, lineHeight: 1, opacity: 0.035 }}>11</div>
        <div style={{ display: "flex", fontSize: 84, letterSpacing: -5 }}>CK<span style={{ color: "transparent" }}>.</span></div>
        {/* the period as a round dot, where the font's square one would sit */}
        <div style={{ position: "absolute", left: 140, top: 106, width: 14, height: 14, borderRadius: 7, background: "#F0561D" }} />
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: font("Geist-Regular.ttf"), weight: 400 }, { name: "Geist", data: font("Geist-Bold.ttf"), weight: 700 }] },
  );
}
