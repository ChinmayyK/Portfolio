import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The card shown when the site is shared or featured (LinkedIn, Slack, X). LinkedIn often shows it
// only 160 to 400 px wide, and prints the full name under it, so the card says hello: a first name,
// large, one line about the work, and the logo, on the site's paper. Host Grotesk SemiBold is under the SIL OFL (src/assets/fonts/OFL.txt).
const asset = (f: string) => readFileSync(join(process.cwd(), "src/assets", f));
const logo = `data:image/png;base64,${asset("og/logo.png").toString("base64")}`;

export const dynamic = "force-static";
export const alt = "Hi, I'm Chinmay. I build apps and the systems behind them.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#141413", PAPER = "#EFEEEA", LIME = "#B9D93A", GREY = "#55544F";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: PAPER, color: INK, padding: "64px 84px 72px", fontFamily: "Host Grotesk", position: "relative" }}>
        <img src={logo} width={128} height={128} alt="" style={{ position: "absolute", top: 64, right: 84 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 196, fontWeight: 600, lineHeight: 0.92, letterSpacing: -8 }}>
            <span>Hi, I&apos;m</span>
            <span style={{ display: "flex" }}>Chinmay<span style={{ color: LIME }}>.</span></span>
          </div>
          <span style={{ fontSize: 50, fontWeight: 600, color: GREY, marginTop: 36, letterSpacing: -1 }}>I build apps and the systems behind them.</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Host Grotesk", data: asset("fonts/HostGrotesk-SemiBold.ttf"), weight: 600, style: "normal" }] },
  );
}
