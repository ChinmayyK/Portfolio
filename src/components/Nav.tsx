"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LINKS = [["#now", "Now"], ["#work", "Work"], ["#background", "Background"], ["#contact", "Contact"]] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [brand, setBrand] = useState(false);

  // highlight the section in view
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const triggers = LINKS.map(([href]) => ScrollTrigger.create({
      trigger: href, start: "top 40%", end: "bottom 40%",
      onToggle: (s) => setCurrent((c) => (s.isActive ? href : c === href ? null : c)),
    }));
    // on phones the pill tucks away while scrolling down and comes back on the way up (CSS gates it by width)
    const dir = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => setHidden(s.direction === 1 && s.scroll() > innerHeight * 0.5) });
    // show the name in the pill once the hero's name is out of view
    const name = ScrollTrigger.create({ trigger: "#top h1", start: "bottom top+=40", onEnter: () => setBrand(true), onLeaveBack: () => setBrand(false) });
    return () => { triggers.forEach((t) => t.kill()); dir.kill(); name.kill(); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className={`nav${hidden && !open ? " hide" : ""}${brand || open ? " brand" : ""}`} aria-label="Main">
        <a className="me" href="#top" inert={!(brand || open)}>Chinmay Kudalkar</a>
        <div className="links">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} aria-current={current === href ? "true" : undefined}>{label}</a>
          ))}
        </div>
        <button className="burger" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          <i /><i />
        </button>
      </nav>
      <div className={`menu${open ? " open" : ""}`} id="menu" aria-hidden={!open} inert={!open}>
        {LINKS.map(([href, label], i) => (
          <a key={href} href={href} style={{ "--i": i } as CSSProperties} onClick={() => setOpen(false)}><span>{label}</span></a>
        ))}
      </div>
    </>
  );
}
