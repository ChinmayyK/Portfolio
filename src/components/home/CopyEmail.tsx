"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="t-small copy-email"
      onClick={async () => {
        try { await navigator.clipboard.writeText(email); setDone(true); setTimeout(() => setDone(false), 2200); } catch { /* clipboard blocked: the mailto link still works */ }
      }}
    >
      <span aria-live="polite">{done ? "Copied to clipboard" : "Copy address"}</span>
    </button>
  );
}
