"use client";

import { useEffect, useState } from "react";

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

export default function Nav() {
  const [dark, setDark] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    const tick = () => setTime(clock.format(new Date()));
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    const apply = () => { document.documentElement.dataset.theme = next; setDark(!dark); };
    try { localStorage.setItem("theme", next); } catch {}
    // cross-fade the whole page where View Transitions exist
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
  }

  return (
    <header className="bar wrap mono">
      <a href="#top">Chinmay Kudalkar</a>
      <nav>
        <a href="#work">Work</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </nav>
      <span className="bar-end">
        <span suppressHydrationWarning>{time && `${time} IST`}</span>
        <button type="button" className="switch" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
          <span>{dark ? "Dark" : "Light"}</span>
        </button>
      </span>
    </header>
  );
}
