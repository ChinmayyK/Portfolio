import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The card shown when the site is shared or featured (LinkedIn, Slack, X). It has to read at
// thumbnail size: the logo, the name large, the role, and real screens of Link All.
// Host Grotesk is under the SIL OFL (src/assets/fonts/OFL.txt).
const asset = (f: string) => readFileSync(join(process.cwd(), "src/assets", f));
const dataUri = (f: string) => `data:image/png;base64,${asset(`og/${f}`).toString("base64")}`;
const font = asset("fonts/HostGrotesk-Regular.ttf");

export const dynamic = "force-static";
export const alt = "Chinmay Kudalkar, software engineer in Mumbai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#EFEEEA", PANEL = "#E4E3DE", INK = "#141413", GREY = "#5F5E5A";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: INK, fontFamily: "Host Grotesk", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 0 52px 64px", width: 620 }}>
          <img src={dataUri("logo.png")} width={88} height={88} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 128, lineHeight: 0.92, letterSpacing: -6 }}>
              <span>Chinmay</span>
              <span>Kudalkar</span>
            </div>
            <span style={{ fontSize: 34, marginTop: 30, letterSpacing: -0.5 }}>Software engineer · Mumbai</span>
          </div>
          <span style={{ fontSize: 24, color: GREY }}>chinmaykudalkar.com</span>
        </div>

        <div style={{ position: "absolute", left: 660, top: 40, right: 0, bottom: 0, background: PANEL, borderRadius: "28px 0 0 0", display: "flex" }}>
          <img src={dataUri("mac.png")} width={640} height={423} alt="" style={{ position: "absolute", left: 56, top: 70, borderRadius: 14, boxShadow: "0 30px 60px -20px rgba(0,0,0,.35)" }} />
          <img src={dataUri("phone.png")} width={170} height={380} alt="" style={{ position: "absolute", left: 30, top: 250, borderRadius: 26, boxShadow: "0 30px 60px -18px rgba(0,0,0,.4)" }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Host Grotesk", data: font, weight: 400, style: "normal" }] },
  );
}
