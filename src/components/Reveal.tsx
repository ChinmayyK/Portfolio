"use client";

import { useEffect } from "react";

/** Marks each [data-r] element with data-in the first time it scrolls into view; the CSS does the rest. */
export default function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
