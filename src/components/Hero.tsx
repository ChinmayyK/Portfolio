"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowDown, DownloadSimple } from "@phosphor-icons/react";
import { PROJECTS, imgProps } from "@/lib/content";

const at = (t: string) => PROJECTS.findIndex((p) => p.t === t);

// Entrance order (--i) runs back to front; depth sets how far each drifts with the pointer.
const SCENE = [
  { cls: "back c-lineup", i: 0, depth: 12, img: "lineup-dashboard.png", project: "Lineup", what: "Interview platform" },
  { cls: "back c-vault", i: 1, depth: 18, img: "doc-redact-engine.png", project: "BlockVault", what: "Encrypted vault" },
];

/** Asks the project deck to bring card `i` to the front. */
function openInDeck(e: MouseEvent, i: number) {
  e.preventDefault();
  dispatchEvent(new CustomEvent("deck:go", { detail: i }));
}

export default function Hero() {
  const [stage, setStage] = useState(""); // "" -> "go" (entrance) -> "go settled" (pointer drift, hover)
  const hero = useRef<HTMLElement>(null);
  const cas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStage("go"));
    const t = setTimeout(() => setStage("go settled"), 2000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  // cards drift by depth with the pointer, like plates at different heights
  useEffect(() => {
    const el = hero.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (min-width: 901px)").matches) return;
    let raf = 0, tx = 0, ty = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cas.current?.querySelectorAll<HTMLElement>(".bezel").forEach((b) => {
          const d = Number(b.dataset.depth);
          b.style.setProperty("--px", `${(-tx * d).toFixed(1)}px`);
          b.style.setProperty("--py", `${(-ty * d).toFixed(1)}px`);
        });
      });
    };
    el.addEventListener("pointermove", move);
    return () => { el.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  const linkAll = at("Link All");

  return (
    <header className={`hero ${stage}`} id="top" ref={hero}>
      <div className="wrap">
        <div>
          <span className="chip" data-r>Web and mobile developer</span>
          <h1 aria-label="Chinmay Kudalkar">
            <span className="ln" aria-hidden="true"><span style={{ "--i": 0 } as CSSProperties}>Chinmay</span></span>
            <span className="ln" aria-hidden="true"><span style={{ "--i": 1 } as CSSProperties}>Kudalkar<span className="dot">.</span></span></span>
          </h1>
          <p className="sub" data-r style={{ "--d": "300ms" } as CSSProperties}>
            I build web and mobile apps, and the backend services behind them. Final-year B.Tech student, graduating in 2027.
          </p>
          <div className="cta" data-r style={{ "--d": "420ms" } as CSSProperties}>
            <a className="pill dark" href="#work">See my work <span className="isl"><ArrowDown weight="light" /></span></a>
            <a className="pill light" href="/Chinmay_Kudalkar_Resume.pdf" download>Résumé <span className="isl"><DownloadSimple weight="light" /></span></a>
          </div>
        </div>

        <div className="cascade" ref={cas}>
          {SCENE.map((c) => (
            <a key={c.project} href="#work" className={`bezel lifted ${c.cls}`} data-depth={c.depth} style={{ "--i": c.i } as CSSProperties}
              onClick={(e) => openInDeck(e, at(c.project))} aria-label={`${c.project}: ${c.what}. See the project.`}>
              <div className="core">
                <img {...imgProps(c.img)} alt="" />
                <div className="cap"><span>{c.project}</span><span>{c.what}</span></div>
              </div>
            </a>
          ))}
          <a href="#work" className="bezel lifted main" data-depth={30} style={{ "--i": 2 } as CSSProperties}
            onClick={(e) => openInDeck(e, linkAll)} aria-label="Link All, my latest project. See the project.">
            <div className="core">
              <img {...imgProps("linkall-mac-devices.png")} alt="" />
              <div className="cap">
                <span><b>Link All</b><span className="chip">Latest project</span></span>
                <span>Clipboard and files across devices</span>
              </div>
            </div>
          </a>
          <a href="#work" className="bezel lifted phone" data-depth={46} style={{ "--i": 3 } as CSSProperties}
            onClick={(e) => openInDeck(e, linkAll)} tabIndex={-1} aria-hidden="true">
            <div className="core"><img {...imgProps("linkall-android-home.png")} alt="" /></div>
          </a>
        </div>
      </div>
    </header>
  );
}
