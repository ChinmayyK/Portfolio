import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { commitsAtBuild } from "@/lib/commits";

// Geist (SIL OFL, see src/assets/fonts/OFL.txt), so the image matches the site's type.
const font = (file: string) => readFileSync(join(process.cwd(), "src/assets/fonts", file));

// Rendered once at build time (static export) into the share card LinkedIn, WhatsApp and X show:
// a few of the board's tiles, with the real GitHub year along the bottom.
export const dynamic = "force-static";
export const alt = "Chinmay Kudalkar, full-stack developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0A0A0B", TILE = "#131315", LINE = "rgba(255,255,255,.08)", INK = "#EDEDED", INK2 = "#8B8B90", INK3 = "#5A5A60", ACCENT = "#FF5A1F";
const GREENS = ["#1B1F24", "#0E4429", "#006D32", "#26A641", "#39D353"];
const CELL = 12, GAP = 3;

const tile = { display: "flex", flexDirection: "column", justifyContent: "space-between", background: TILE, border: `1px solid ${LINE}`, borderRadius: 24, padding: 28, position: "relative", overflow: "hidden" } as const;
const label = { display: "flex", alignItems: "center", fontSize: 15, letterSpacing: 2.5, color: INK3 } as const;
const dot = { width: 9, height: 9, borderRadius: 9, background: ACCENT, marginRight: 10 } as const;

export default async function OpengraphImage() {
  const days = await commitsAtBuild();
  const lead = days.length ? new Date(days[0].date + "T00:00:00").getDay() : 0;
  const levels = [...Array<number>(lead).fill(-1), ...days.map((d) => d.level)];
  const weeks = Array.from({ length: Math.ceil(levels.length / 7) }, (_, w) => levels.slice(w * 7, w * 7 + 7));
  const total = days.reduce((s, d) => s + d.count, 0);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 16, padding: 36, background: BG, fontFamily: "Geist" }}>
        <div style={{ display: "flex", gap: 16, height: 326 }}>
          <div style={{ ...tile, width: 700 }}>
            {/* the drifting glow from the site's name tile, held still */}
            <div style={{ position: "absolute", right: -140, top: -220, width: 520, height: 520, borderRadius: 520, background: "radial-gradient(circle, rgba(255,90,31,.38), rgba(255,90,31,0) 65%)" }} />
            <div style={label}>FULL-STACK DEVELOPER</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "column", fontSize: 100, fontWeight: 700, letterSpacing: -5, lineHeight: 0.92, color: INK }}>
                <span>Chinmay</span>
                <span>Kudalkar</span>
              </div>
              <div style={{ display: "flex", fontSize: 24, color: INK2, marginTop: 18 }}>I build software for the web, phones and desktop.</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <div style={{ ...tile, flex: 1 }}>
              <div style={label}><div style={dot} />NOW · SINCE AUG 2026</div>
              <div style={{ display: "flex", fontSize: 32, letterSpacing: -1, color: INK }}>Fleet software at ideaForge</div>
            </div>
            <div style={{ ...tile, height: 128 }}>
              <div style={label}>STATUS</div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 21, color: INK }}><div style={dot} />Open to full-time roles from 2027</div>
            </div>
          </div>
        </div>

        <div style={{ ...tile, flex: 1, flexDirection: "row", alignItems: "center", gap: 28, padding: "22px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: 230 }}>
            <div style={label}>GITHUB · LAST YEAR</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -2, color: INK }}>{total.toLocaleString("en-IN")}</div>
              <div style={{ display: "flex", fontSize: 18, color: INK2 }}>contributions</div>
            </div>
            <div style={{ display: "flex", fontSize: 18, color: INK2 }}>chinmaykudalkar.com</div>
          </div>
          <div style={{ display: "flex", gap: GAP, marginLeft: "auto" }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {w.map((l, j) => <div key={j} style={{ width: CELL, height: CELL, borderRadius: 3, background: l < 0 ? "transparent" : GREENS[l] }} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: font("Geist-Regular.ttf"), weight: 400 }, { name: "Geist", data: font("Geist-Bold.ttf"), weight: 700 }] },
  );
}
