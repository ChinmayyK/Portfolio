"use client";

import { Stage } from "@/kit/stage";
import { Phone } from "@/kit/phone";
import type { Act } from "@/kit/act";
import { useSiteTheme } from "@/components/useSiteTheme";
import "./linkall-phone.css";

// Link All on Android, beside the Mac screenshots: the other end of the link.
// The screen is real captures of the app (home, activity, devices), cross-fading
// in turn; only the phone around them is drawn. The captures carry their own
// status bar, so the frame draws none.
const SCREENS = ["home", "history", "devices"];

type S = { n: number };

// each screen holds four seconds; the last hands back to home, so the loop has no seam
async function script(a: Act<S>) {
  for (let n = 1; n <= SCREENS.length; n++) {
    await a.wait(4000);
    a.put({ n: n % SCREENS.length });
  }
}

export default function LinkAllPhone() {
  const theme = useSiteTheme();
  const dark = theme === "dark";
  return (
    <Stage<S> width={330} height={560} theme={theme} initial={{ n: 0 }} script={script} className="la">
      {(st) => (
        <Phone width={320} frame="android" dark={dark} status={false} island={false} className="la-phone">
          <div className="la-screens">
            {SCREENS.map((s, i) => (
              <img
                key={s}
                src={`/img/linkall-android-${s}${dark ? "-dark" : ""}.webp`}
                alt=""
                width={412}
                height={921}
                decoding="async"
                data-on={i === st.n || undefined}
              />
            ))}
          </div>
        </Phone>
      )}
    </Stage>
  );
}
