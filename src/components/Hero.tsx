"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import Shot from "@/components/Shot";

type Work = "" | "web" | "phone" | "desk";

const CAPTION: Record<Work, string> = {
  "": "A few things I’ve worked on. Point at or tap a word to match it.",
  web: "iF FleetDesk at ideaForge: booking and live tracking for the company’s vehicles. It’s internal, so this is a sketch, not a screenshot.",
  phone: "Link All on Android, a side project: my clipboard and files, shared between my own devices.",
  desk: "Link All on macOS. The same app, built natively for each platform.",
};

export default function Hero() {
  const [on, setOn] = useState<Work>("");
  const [time, setTime] = useState("");
  const via = useRef("mouse"); // what pressed a word last

  // local time in India, ticking over each minute (rendered after mount, so the static HTML never holds a stale time)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    let t = 0;
    const tick = () => { setTime(fmt.format(new Date()).toUpperCase()); t = window.setTimeout(tick, 60000 - (Date.now() % 60000)); };
    tick();
    return () => clearTimeout(t);
  }, []);

  // a mouse points at a word or a card to bring that piece of work forward; touch taps a word instead,
  // since a finger's pointerleave would clear it the moment it lifts
  const point = (w: Work) => ({
    onPointerEnter: (e: PointerEvent) => { if (e.pointerType === "mouse") setOn(w); },
    onPointerLeave: (e: PointerEvent) => { if (e.pointerType === "mouse") setOn(""); },
  });
  // keyboard focus shows the piece as well; a tap or a keypress on the shown word hides it again,
  // while a mouse click leaves it shown, since pointing already brought it forward
  const word = (w: Work, label: ReactNode, after = "") => (
    <span className="nb">
      <button type="button" className="word" aria-pressed={on === w} {...point(w)}
        onPointerDown={(e) => { via.current = e.pointerType; }}
        onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setOn(w); }} onBlur={() => setOn("")}
        onClick={(e) => { const toggle = e.detail === 0 || via.current !== "mouse"; setOn((c) => (toggle && c === w ? "" : w)); }}>{label}</button>{after}
    </span>
  );

  return (
    <header className="hero" id="top">
      <div className="wrap split">
        <div className="say">
          <h1 data-r>
            <span className="by">Chinmay Kudalkar · Full-stack developer</span>
            <span className="big">
              I build apps for {word("web", "the web", ",")} {word("phone", "phones")} and {word("desk", "desktops", ",")}
              {" "}<span className="soft">from the database to the screen</span><span className="dot">.</span>
            </span>
          </h1>
          <p className="lede" data-r style={{ "--d": "120ms" } as CSSProperties}>Currently a developer intern at ideaForge, Navi Mumbai. Graduating in 2027.</p>
          <div className="cta" data-r style={{ "--d": "200ms" } as CSSProperties}>
            <a className="pill dark" href="#link-all">See my work <span className="isl"><ArrowDown weight="light" /></span></a>
            <a className="pill light" href="#contact">Say hello <span className="isl"><ArrowUpRight weight="light" /></span></a>
          </div>
        </div>

        <figure className="works" data-r style={{ "--d": "280ms" } as CSSProperties}>
          <div className="pile" data-on={on || undefined}>
            <a href="#link-all" className="card desk" aria-label="Link All on macOS" {...point("desk")}>
              <span className="plate"><Shot file="linkall-mac-clipboard.png" alt="" /></span>
            </a>
            <a href="#now" className="card web" aria-label="Fleet map, iF FleetDesk at ideaForge" {...point("web")}>
              <span className="plate">
                <span className="sketch" aria-hidden="true">
                  <span className="bar"><b>Fleet map</b><span>5 vehicles</span></span>
                  <span className="map">
                    <i style={{ left: "-10%", top: "46%", width: "120%", height: 3, rotate: "-8deg" }} />
                    <i style={{ left: "30%", top: "-10%", width: 3, height: "120%", rotate: "14deg" }} />
                    <i style={{ left: "62%", top: "-10%", width: 3, height: "120%", rotate: "-6deg" }} />
                    <b style={{ left: "22%", top: "50%" }} /><b style={{ left: "47%", top: "38%" }} />
                    <b style={{ left: "66%", top: "20%" }} /><b style={{ left: "34%", top: "74%" }} />
                    <b className="stale" style={{ left: "80%", top: "62%" }} />
                  </span>
                  <span className="bar"><span>4 moving</span><em>1 stale GPS</em></span>
                </span>
              </span>
            </a>
            <a href="#link-all" className="card phone" aria-label="Link All on Android" {...point("phone")}>
              <span className="plate"><Shot file="linkall-android-home.png" alt="" /></span>
            </a>
          </div>
          <figcaption aria-live="polite">{CAPTION[on]}</figcaption>
        </figure>
      </div>

      <p className="wrap status">
        <span>Now</span> <a href="#now">Interning at ideaForge</a> <i>· Navi Mumbai</i>{time && <> <i>· <time>{time} IST</time></i></>}
        {" "}<i className="open">· Open to full-time roles from 2027</i>
      </p>
    </header>
  );
}
