"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, DownloadSimple } from "@phosphor-icons/react";

const CARDS = [
  { cls: "c0", depth: 14, img: "lineup-dashboard.png", name: "Lineup", what: "Interview platform" },
  { cls: "c1", depth: 26, img: "linkall-mac-devices.png", name: "Link All", what: "Clipboard and files" },
  { cls: "c2", depth: 40, img: "doc-redact-engine.png", pos: "center top", name: "BlockVault", what: "Encrypted vault" },
];

export default function Hero() {
  const [stage, setStage] = useState(""); // "" -> "go" (entrance) -> "go settled" (pointer drift)
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

  return (
    <header className={`hero ${stage}`} id="top" ref={hero}>
      <div className="wrap">
        <div>
          <span className="chip" data-r>Web and mobile developer</span>
          <h1 aria-label="Chinmay Kudalkar">
            <span className="ln" aria-hidden="true"><span style={{ "--i": 0 } as CSSProperties}>Chinmay</span></span>
            <span className="ln" aria-hidden="true"><span style={{ "--i": 1 } as CSSProperties}>Kudalkar</span></span>
          </h1>
          <p className="sub" data-r style={{ "--d": "300ms" } as CSSProperties}>
            I build web and mobile apps, and the backend services behind them. Final-year B.Tech student, graduating in 2027.
          </p>
          <div className="cta" data-r style={{ "--d": "420ms" } as CSSProperties}>
            <a className="pill dark" href="#work">See my work <span className="isl"><ArrowDown weight="light" /></span></a>
            <a className="pill light" href="/Chinmay_Kudalkar_Resume.pdf" download>Résumé <span className="isl"><DownloadSimple weight="light" /></span></a>
          </div>
        </div>
        <div className="cascade" ref={cas} aria-hidden="true">
          {CARDS.map((c, i) => (
            <div key={c.cls} className={`bezel lifted ${c.cls}`} style={{ "--i": i } as CSSProperties} data-depth={c.depth}>
              <div className="core">
                <img src={`/img/${c.img}`} alt="" style={c.pos ? { objectPosition: c.pos } : undefined} />
                <div className="cap"><span>{c.name}</span><span>{c.what}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
