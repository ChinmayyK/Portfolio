"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LINKS = [["#now", "Now"], ["#work", "Work"], ["#background", "Background"], ["#contact", "Contact"]] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  // highlight the section in view
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const triggers = LINKS.map(([href]) => ScrollTrigger.create({
      trigger: href, start: "top 40%", end: "bottom 40%",
      onToggle: (s) => setCurrent((c) => (s.isActive ? href : c === href ? null : c)),
    }));
    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className="nav" aria-label="Main">
        <a className="me" href="#top">Chinmay Kudalkar</a>
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
