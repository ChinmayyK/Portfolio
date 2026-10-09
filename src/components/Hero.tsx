"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import Shot from "@/components/Shot";
import { detect } from "@/lib/visitor";

export default function Hero() {
  const [stage, setStage] = useState(""); // "" -> "go" (entrance) -> "go settled" (pointer drift, hover)
  const hero = useRef<HTMLElement>(null);
  const cas = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState("");
  const [win, setWin] = useState(false); // Windows visitors see Link All on Windows, matching the scene this card flies into

  useEffect(() => { setWin(!!detect()?.win); }, []);

  // local time in India, ticking over each minute (rendered after mount, so the static HTML never holds a stale time)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    let t = 0;
    const tick = () => { setTime(fmt.format(new Date()).toUpperCase()); t = window.setTimeout(tick, 60000 - (Date.now() % 60000)); };
    tick();
    return () => clearTimeout(t);
  }, []);

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
            <span className="ln" aria-hidden="true"><span style={{ "--i": 1 } as CSSProperties}>Kudalkar<span className="dot">.</span></span></span>
          </h1>
          <p className="claim" data-r style={{ "--d": "260ms" } as CSSProperties}>I build apps that keep working when the network doesn&apos;t.</p>
          <p className="sub" data-r style={{ "--d": "340ms" } as CSSProperties}>
            Web and mobile apps, and the backend services behind them. Final-year B.Tech student, graduating in 2027.
          </p>
          <div className="cta" data-r style={{ "--d": "420ms" } as CSSProperties}>
            <a className="pill dark" href="#link-all">See my work <span className="isl"><ArrowDown weight="light" /></span></a>
            <a className="pill light" href="/resume" target="_blank" rel="noopener">Résumé <span className="isl"><ArrowUpRight weight="light" /></span></a>
          </div>
          <p className="status" data-r style={{ "--d": "520ms" } as CSSProperties}>
            <span>Now</span> <a href="#now">iF FleetDesk at ideaForge</a> <i className="loc">· Navi Mumbai</i>{time && <> <i>· <time>{time} IST</time></i></>}
          </p>
        </div>

        <div className="cascade" ref={cas}>
          <a href="#link-all" className="bezel lifted main" data-depth={22} style={{ "--i": 0 } as CSSProperties}
            aria-label="Link All, my latest project. See the project.">
            <div className="core">
              <Shot file={win ? "linkall-win-clipboard.png" : "linkall-mac-devices.png"} alt="" />
              <div className="cap">
                <span><b>Link All</b><span className="chip">Latest project</span></span>
              </div>
            </div>
          </a>
          <a href="#link-all" className="bezel lifted phone" data-depth={40} style={{ "--i": 1 } as CSSProperties}
            tabIndex={-1} aria-hidden="true">
            <div className="core"><Shot file="linkall-android-home.png" alt="" /></div>
          </a>
        </div>
      </div>
    </header>
  );
}
