"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function CopyButton({ text, icon }: { text: string; icon: ReactNode }) {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try { await navigator.clipboard.writeText(text); setMsg("Copied to clipboard."); }
    catch { setMsg("Couldn't copy. Select the address instead."); }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 2600);
  }

  return (
    <>
      <div className="row">
        <button className="pill light" type="button" onClick={copy}>Copy address <span className="isl">{icon}</span></button>
      </div>
      <output className="copied mono" aria-live="polite">{msg}</output>
    </>
  );
}
