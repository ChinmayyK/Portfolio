"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // On mount, sync with the current document state
    const currentTheme = document.documentElement.dataset.theme as Theme;
    if (currentTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(currentTheme);
    } else {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    // 1. Update state
    setTheme(newTheme);
    
    // 2. Update DOM
    document.documentElement.dataset.theme = newTheme;
    document.documentElement.style.colorScheme = newTheme;
    
    // 3. Update localStorage
    localStorage.setItem("portfolio-theme", newTheme);
    
    // 4. Notify other instances of useTheme
    window.dispatchEvent(new CustomEvent("theme-change", { detail: newTheme }));
  };

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  return { theme, toggleTheme };
}
