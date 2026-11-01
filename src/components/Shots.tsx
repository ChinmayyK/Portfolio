"use client";

import { useEffect, useRef, useState } from "react";

const STEP_MS = 3400;

/** A project's screens, cross-fading one to the next while they're on screen. Light and dark captures follow the theme. */
export default function Shots({ files, alt }: { files: string[]; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  // screens are fetched one ahead of the one showing, never all at once
  const [reach, setReach] = useState(1);
  useEffect(() => setReach((r) => Math.max(r, n + 1)), [n]);

  useEffect(() => {
    const el = box.current;
    if (!el || files.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setN((i) => (i + 1) % files.length), STEP_MS);
    });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); };
  }, [files.length]);

  return (
    <div className="shots" ref={box}>
      {files.map((f, i) => i <= reach && (
        <div key={f} className={i === n ? "on" : ""}>
          <img className="on-light" src={`/img/${f}`} alt={i === 0 ? alt : ""} loading="lazy" decoding="async" />
          <img className="on-dark" src={`/img/${f.replace(/\.webp$/, "-dark.webp")}`} alt="" loading="lazy" decoding="async" />
        </div>
      ))}
    </div>
  );
}
