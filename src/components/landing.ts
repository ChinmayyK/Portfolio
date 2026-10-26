type Run = { anims: Animation[]; done: () => void };

export function land(board: HTMLElement) {
  if (board.classList.contains("landed")) return; // once: React runs effects twice in development
  const tiles = [...board.querySelectorAll<HTMLElement>(":scope > .tile")];
  board.classList.add("landed");
  if (!tiles.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const run = swoop(board, tiles);
  // any click, key or scroll skips to the finished board
  const events = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
  const done = () => { run.done(); events.forEach((e) => removeEventListener(e, skip)); };
  const skip = () => { run.anims.forEach((a) => a.finish()); done(); };
  events.forEach((e) => addEventListener(e, skip, { once: true, passive: true }));
  Promise.all(run.anims.map((a) => a.finished)).then(done, done);
}

// The landing: the board starts laid out like a table seen from low down, dark, tilted and far away. The tiles rise off
// it in a wave spreading out from the name, a light sweeps across, and the camera swoops up to look straight
// down at it. Each tile lights its edge as it lifts, the year of GitHub squares switches on behind the light, and
// the name card takes the knock as the camera lands.

const SWOOP = 2600; // the camera's move
const RISE = 760; // a tile lifting off the table
const WAVE = 0.45; // ms of delay per pixel from the name
const P = 1300; // the camera's perspective

function swoop(board: HTMLElement, tiles: HTMLElement[]): Run {
  const vh = innerHeight, b = board.getBoundingClientRect();
  const lead = board.querySelector<HTMLElement>(":scope > .t-id") ?? tiles[0];
  const l = lead.getBoundingClientRect(), lx = l.left + l.width / 2, ly = l.top + l.height / 2;
  const timers: number[] = [];

  // 3D needs the board's isolation off for the move; the camera pivots on the middle of the screen
  const pivot = vh / 2 - b.top;
  Object.assign(board.style, { isolation: "auto", transformStyle: "preserve-3d", transformOrigin: `50% ${pivot}px` });
  // a tall board tilted toward the camera would reach past it, so push it back far enough and scale to make up
  const back = (tilt: number) => Math.max(0, (b.height - pivot) * Math.sin((tilt * Math.PI) / 180) - P * 0.7);
  const view = (tilt: number, turn: number, scale: number, lift: number) => {
    const d = back(tilt);
    return `perspective(${P}px) translateZ(${-d.toFixed(0)}px) translateY(${lift}%) rotateX(${tilt}deg) rotateZ(${turn}deg) scale(${(scale * (P + d) / P).toFixed(3)})`;
  };
  const camera = board.animate(
    [
      { transform: view(52, -18, 0.62, 4), filter: "brightness(.35)" },
      { offset: 0.35, transform: view(46, -14, 0.68, 3), filter: "brightness(.8)" },
      { transform: view(0, 0, 1, 0), filter: "brightness(1)" },
    ],
    { duration: SWOOP, easing: "cubic-bezier(.6,0,.2,1)", fill: "backwards" },
  );

  const rises = tiles.flatMap((t) => {
    const r = t.getBoundingClientRect();
    // the name goes first, alone for a beat, then the wave spreads from it
    const delay = t === lead ? 60 : 380 + Math.min(1100, Math.hypot(r.left + r.width / 2 - lx, r.top + r.height / 2 - ly) * WAVE);
    const lit = getComputedStyle(t).borderColor;
    return [
      t.animate(
        [
          { transform: "translateZ(-60px) scale(.94)", opacity: 0 },
          { offset: 0.55, transform: "translateZ(70px) scale(1.02)", opacity: 1 },
          { transform: "translateZ(0px) scale(1)", opacity: 1 },
        ],
        { duration: RISE, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
      ),
      // its edge flares as it lifts, then cools
      t.animate(
        [{ borderColor: "var(--accent)", boxShadow: "0 0 40px -8px var(--accent)" }, { borderColor: lit, boxShadow: "0 0 0 0 transparent" }],
        { duration: RISE * 1.6, delay: delay + RISE * 0.3, easing: "cubic-bezier(.4,0,.2,1)", fill: "backwards" },
      ),
    ];
  });

  // the year of squares switches on week by week as the light passes over the graph
  const cells = [...board.querySelectorAll<HTMLElement>(".hm i:not(.pad)")];
  const lit = cells.map((c, k) => c.animate(
    [{ opacity: 0.08, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: 380, delay: SWOOP * 0.3 + Math.floor(k / 7) * 18 + (k % 7) * 6, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "backwards" },
  ));

  // a band of light passing over the board
  const sweep = document.createElement("div");
  sweep.className = "intro-sweep";
  sweep.setAttribute("aria-hidden", "true");
  board.append(sweep);
  const light = sweep.animate(
    [{ backgroundPosition: "120% 0", opacity: 0 }, { offset: 0.2, opacity: 1 }, { offset: 0.8, opacity: 1 }, { backgroundPosition: "-20% 0", opacity: 0 }],
    { duration: SWOOP * 0.85, delay: SWOOP * 0.12, easing: "cubic-bezier(.45,0,.55,1)", fill: "both" },
  );

  timers.push(window.setTimeout(() => hit(board, l, b, true), SWOOP));
  return {
    anims: [camera, light, ...rises, ...lit],
    done: () => {
      sweep.remove();
      Object.assign(board.style, { isolation: "", transformStyle: "", transformOrigin: "" });
    },
  };
}

/** A tile hitting the board: an outline of it rings out and the board takes the knock, harder for bigger tiles. */
function hit(board: HTMLElement, r: DOMRect, b: DOMRect, hard: boolean) {
  if (r.bottom < 0 || r.top > innerHeight) return; // out of sight, out of mind
  const echo = document.createElement("div");
  echo.className = "intro-echo";
  Object.assign(echo.style, { left: `${r.left - b.left}px`, top: `${r.top - b.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  board.append(echo);
  echo.animate(
    [{ opacity: 0.9, transform: "scale(1)" }, { opacity: 0, transform: `scale(${hard ? 1.12 : 1.06})` }],
    { duration: hard ? 900 : 600, easing: "cubic-bezier(.22,1,.36,1)" },
  ).finished.then(() => echo.remove(), () => {});
  const knock = hard ? 9 : Math.min(5, Math.max(1.5, Math.sqrt(r.width * r.height) / 90));
  board.animate(
    [
      { transform: "none" },
      { transform: `translate(${knock}px, ${knock * 0.6}px)` },
      { transform: `translate(${-knock * 0.6}px, ${-knock * 0.4}px)` },
      { transform: `translate(${knock * 0.25}px, ${knock * 0.15}px)` },
      { transform: "none" },
    ],
    { duration: hard ? 420 : 260, easing: "ease-out" },
  );
}
