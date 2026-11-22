"use client";

import { useSyncExternalStore } from "react";
import { SITE } from "@/content/site";

const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: SITE.timeZone });

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
}

/** Local time in Mumbai, updated each quarter-minute. Renders nothing on the server to avoid a mismatch. */
export default function LocalTime() {
  const time = useSyncExternalStore(subscribe, () => fmt.format(Date.now()), () => "");
  return <time suppressHydrationWarning>{time ? `${time} IST` : "IST"}</time>;
}
