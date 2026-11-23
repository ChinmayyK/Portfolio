import { SHOTS, type Shot } from "@/content/projects";
import RouteIllustration from "@/components/work/RouteIllustration";

type Tile = { caption: string; shots?: Shot[]; route?: boolean; note?: string };

// Two rows of real captures that slide against each other as the page scrolls.
const ROWS: { drift: number; tiles: Tile[] }[] = [
  {
    drift: -14,
    tiles: [
      { caption: "Link All — macOS", shots: [SHOTS.macDevices] },
      { caption: "Link All — Android", shots: [SHOTS.androidHome, SHOTS.androidDevices] },
      { caption: "Link All — Windows", shots: [SHOTS.winClipboard] },
      { caption: "Link All — Linux", shots: [SHOTS.linuxDevices] },
    ],
  },
  {
    drift: 14,
    tiles: [
      { caption: "StreamDisk — macOS", shots: [SHOTS.streamdisk] },
      { caption: "Link All", note: "One Rust core, four native apps." },
      { caption: "iF FleetDesk — illustration", route: true },
      { caption: "Link All — macOS", shots: [SHOTS.macTransfers] },
    ],
  },
];

// eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized webp
const Img = ({ s }: { s: Shot }) => <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async" />;

export default function Showcase() {
  return (
    <section className="showcase" aria-label="Screens from the work">
      {ROWS.map((row, r) => (
        <div key={r} className="showcase-row" data-slide={row.drift}>
          {row.tiles.map((t) => (
            <figure key={t.caption + r} className={`showcase-tile ${t.note ? "is-note" : ""}`}>
              <div className="showcase-frame">
                {t.shots && t.shots.length > 1
                  ? <div className="showcase-pair">{t.shots.map((s) => <Img key={s.src} s={s} />)}</div>
                  : t.shots && <Img s={t.shots[0]} />}
                {t.route && <RouteIllustration progress={0.4} />}
                {t.note && <p className="t-h3">{t.note}</p>}
              </div>
              <figcaption className="t-label">{t.caption}</figcaption>
            </figure>
          ))}
        </div>
      ))}
    </section>
  );
}
