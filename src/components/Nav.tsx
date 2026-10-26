"use client";

import { useEffect, useState } from "react";
import { SOCIALS } from "@/lib/content";

export default function Nav() {
  const [dark, setDark] = useState(true);

  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);

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
      <span className="bar-end">
        <nav>{SOCIALS.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</nav>
        <button type="button" className="switch" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
          <span>{dark ? "Dark" : "Light"}</span>
        </button>
      </span>
    </header>
  );
}
