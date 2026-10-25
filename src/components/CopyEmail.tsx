"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export default function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(email); } catch { return; }
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };
  return (
    <button type="button" className="b-btn" onClick={copy}>
      {done ? <Check weight="light" /> : <Copy weight="light" />}
      <span aria-live="polite">{done ? "Copied" : "Copy email"}</span>
    </button>
  );
}
