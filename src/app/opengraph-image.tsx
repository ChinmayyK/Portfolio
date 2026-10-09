import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Geist (SIL OFL, see src/assets/fonts/OFL.txt), so the image matches the site's type.
const font = (file: string) => readFileSync(join(process.cwd(), "src/assets/fonts", file));

// Rendered once at build time (static export) into the share card LinkedIn, WhatsApp and X show.
export const dynamic = "force-static";
export const alt = "Chinmay Kudalkar, full-stack developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const shot = (file: string) => `data:image/png;base64,${readFileSync(join(process.cwd(), "public/img", file)).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Geist", background: "#ECEDEF", padding: 64, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", padding: "8px 16px", borderRadius: 99, border: "1px solid rgba(20,24,32,.1)", background: "rgba(20,24,32,.045)", color: "#565B64", fontSize: 20, letterSpacing: 3, alignSelf: "flex-start" }}>
            FULL-STACK DEVELOPER
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 112, fontWeight: 700, letterSpacing: -6, lineHeight: 0.95, color: "#0E0F12" }}>
            <span>Chinmay</span>
            <span style={{ display: "flex" }}>Kudalkar<span style={{ color: "transparent", marginLeft: -6 }}>.</span></span>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#565B64" }}>chinmaykudalkar.com</div>
        </div>
        {/* the period as a round dot, where the font's square one would sit */}
        <div style={{ position: "absolute", left: 507, top: 393, width: 19, height: 19, borderRadius: 10, background: "#F0561D" }} />
        <div style={{ position: "absolute", left: 640, top: 120, width: 720, display: "flex", padding: 3, borderRadius: 14, background: "rgba(20,24,32,.08)", transform: "rotate(-3deg)" }}>
          <img src={shot("linkall-mac-devices.png")} width={714} height={471} style={{ borderRadius: 11 }} />
        </div>
        <div style={{ position: "absolute", left: 1010, top: 250, width: 170, display: "flex", padding: 3, borderRadius: 22, background: "#16171A", transform: "rotate(4deg)" }}>
          <img src={shot("linkall-android-home.png")} width={164} height={367} style={{ borderRadius: 19 }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: font("Geist-Regular.ttf"), weight: 400 }, { name: "Geist", data: font("Geist-Bold.ttf"), weight: 700 }] },
  );
}
