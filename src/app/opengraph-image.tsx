import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The card shown when the site is shared or featured (LinkedIn, Slack, X). LinkedIn often shows it
// only 160 to 400 px wide, so it holds three things, large and high-contrast: the logo, the name
// and the role. Host Grotesk SemiBold is under the SIL OFL (src/assets/fonts/OFL.txt).
const asset = (f: string) => readFileSync(join(process.cwd(), "src/assets", f));
const logo = `data:image/png;base64,${asset("og/logo.png").toString("base64")}`;

export const dynamic = "force-static";
export const alt = "Chinmay Kudalkar, software engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#141413", PAPER = "#EFEEEA", LIME = "#D4F25A";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: INK, color: PAPER, padding: "64px 84px 72px", fontFamily: "Host Grotesk", position: "relative" }}>
        <img src={logo} width={128} height={128} alt="" style={{ position: "absolute", top: 64, right: 84 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 196, fontWeight: 600, lineHeight: 0.92, letterSpacing: -8 }}>
            <span>Chinmay</span>
            <span>Kudalkar</span>
          </div>
          <span style={{ fontSize: 60, fontWeight: 600, color: LIME, marginTop: 30, letterSpacing: -1 }}>Software engineer</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Host Grotesk", data: asset("fonts/HostGrotesk-SemiBold.ttf"), weight: 600, style: "normal" }] },
  );
}
