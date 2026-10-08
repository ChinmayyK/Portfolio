import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Geist (SIL OFL, see src/assets/fonts/OFL.txt), so the image matches the site's type.
const font = (file: string) => readFileSync(join(process.cwd(), "src/assets/fonts", file));

// Home-screen icon for iOS: the same CK monogram as icon.svg, as a PNG.
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Geist", alignItems: "center", justifyContent: "center", background: "#0E0F12", color: "#F9F9FA", fontSize: 84, fontWeight: 700, letterSpacing: -5 }}>
        CK<span style={{ color: "#F0561D" }}>.</span>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: font("Geist-Regular.ttf"), weight: 400 }, { name: "Geist", data: font("Geist-Bold.ttf"), weight: 700 }] },
  );
}
