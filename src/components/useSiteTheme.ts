"use client";

import { useEffect, useState } from "react";

/** Follows the site's light/dark switch, which lives on <html data-theme>. */
export function useSiteTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const html = document.documentElement;
    const read = () => setTheme(html.dataset.theme === "light" ? "light" : "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}
