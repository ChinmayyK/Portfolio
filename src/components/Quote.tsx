"use client";

import { useEffect, useState } from "react";

// [first line, second line]. {n} becomes the live contribution count once the graph has loaded.
const QUOTES: [string, string][] = [
  ["I peaked.", "Then I pushed to main."],
  ["Talk is cheap.", "Here are {n} commits."],
  ["I'd explain my work ethic,", "but I made a chart."],
];

/** Picks a different quote on every page load (never the same one twice in a row). */
export default function Quote() {
  const [i, setI] = useState(0);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let last = -1;
    try { last = Number(localStorage.getItem("quote") ?? -1); } catch {}
    const options = QUOTES.map((_, k) => k).filter((k) => k !== last);
    const next = options[Math.floor(Math.random() * options.length)];
    setI(next);
    try { localStorage.setItem("quote", String(next)); } catch {}

    const onTotal = (e: Event) => setTotal((e as CustomEvent<number>).detail);
    addEventListener("commits:total", onTotal);
    return () => removeEventListener("commits:total", onTotal);
  }, []);

  const [a, b] = QUOTES[i];
  const second = b.replace("{n}", total ? total.toLocaleString("en-IN") : "the");
  return <h2 id="q-h" className="quote" data-r>{a}<br /><span>{second}</span></h2>;
}
