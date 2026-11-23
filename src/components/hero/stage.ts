/**
 * The hero's name as real 3D type. Each letter is extruded from Host Grotesk and stands on the
 * page exactly where the HTML letter sits (one world unit is one CSS pixel at the page's surface),
 * so the swap from flat text to geometry is invisible. Then the letters rise out of the page.
 *
 * A light follows the pointer: from the cursor's side, lower (longer shadows) the further out it
 * goes, and the letters nearest the cursor rise taller. When the pointer rests, the light circles
 * slowly on its own. Scrolling away lowers the letters back into the page.
 * Three.js loads only once the page has drawn, and only if WebGL is there.
 */

import type * as T from "three";

export type Stage = { reveal: (animate: boolean) => void; destroy: () => void };

type Options = {
  host: HTMLElement; // the hero: pointer and scroll are read here
  surface: HTMLElement; // the layer whose coordinates the letters copy
  name: HTMLElement;
  canvas: HTMLCanvasElement;
  xrayCanvas: HTMLCanvasElement;
  lensOpen: () => boolean;
  reduced: boolean;
};

type Glyph = { ch: string; x: number; baseline: number; size: number };

/** every letter's pen position and baseline in the surface's coordinates, transforms set aside */
function measure(name: HTMLElement, surface: HTMLElement): Glyph[] {
  const moved = [name, ...Array.from(name.querySelectorAll<HTMLElement>("*"))];
  const saved = moved.map((m) => m.style.transform);
  moved.forEach((m) => { m.style.transform = "none"; });
  const s = surface.getBoundingClientRect();
  const ctx = document.createElement("canvas").getContext("2d")!;
  const range = document.createRange();
  const out: Glyph[] = [];
  const walker = document.createTreeWalker(name, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    const cs = getComputedStyle(n.parentElement!);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const ascent = ctx.measureText("H").fontBoundingBoxAscent;
    for (let i = 0; i < n.data.length; i++) {
      if (!n.data[i].trim()) continue;
      range.setStart(n, i); range.setEnd(n, i + 1);
      const r = range.getBoundingClientRect();
      out.push({ ch: n.data[i], x: r.left - s.left, baseline: r.top - s.top + ascent, size: parseFloat(cs.fontSize) });
    }
  }
  moved.forEach((m, i) => { m.style.transform = saved[i]; });
  return out;
}

const INK = 0x141413;
const RAD = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export async function createStage(o: Options): Promise<Stage | null> {
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return null;

  const [THREE, { FontLoader }, { TextGeometry }, { RoomEnvironment }, json] = await Promise.all([
    import("three"),
    import("three/examples/jsm/loaders/FontLoader.js"),
    import("three/examples/jsm/geometries/TextGeometry.js"),
    import("three/examples/jsm/environments/RoomEnvironment.js"),
    fetch("/fonts/name.json").then((r) => r.json()),
  ]);
  const font = new FontLoader().parse(json);
  const coarse = matchMedia("(pointer: coarse)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas: o.canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap; // soft, blurred penumbra
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  let xr: T.WebGLRenderer | null = null; // the x-ray's wireframe, made when the lens first opens

  const scene = new THREE.Scene();
  // a soft studio for the lacquer to reflect
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.2;
  room.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 10_000);
  const DIST = 2400;

  // the page: invisible except for the shadows that fall on it
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ color: INK, opacity: 0.17 }));
  ground.receiveShadow = true;
  scene.add(ground);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d6cf, 0.35));
  const key = new THREE.DirectionalLight(0xfffaf0, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 1.5;
  key.shadow.radius = 14;
  key.shadow.blurSamples = 24;
  scene.add(key, key.target);

  // black lacquer: a clear coat over a dark base, so edges and faces catch the light and the studio
  const material = new THREE.MeshPhysicalMaterial({ color: 0x0e0e0d, roughness: 0.34, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12 });
  const wire = new THREE.MeshBasicMaterial({ color: INK, wireframe: true, transparent: true, opacity: 0.55 });

  type Letter = { mesh: T.Mesh; cx: number; cy: number; enter: number; lift: number };
  let letters: Letter[] = [];
  let W = 1, H = 1, size = 100;

  const build = () => {
    W = o.surface.clientWidth; H = o.surface.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = (2 * Math.atan(H / 2 / DIST)) / RAD; // one unit = one CSS pixel at z = 0
    camera.position.set(W / 2, -H / 2, DIST);
    camera.lookAt(W / 2, -H / 2, 0);
    camera.updateProjectionMatrix();
    ground.scale.set(W * 4, H * 4, 1);
    ground.position.set(W / 2, -H / 2, 0);
    key.target.position.set(W / 2, -H / 2, 0);
    const sc = key.shadow.camera;
    sc.left = -W; sc.right = W; sc.top = H; sc.bottom = -H; sc.near = 10; sc.far = 8000;
    sc.updateProjectionMatrix();

    const was = letters;
    letters.forEach((l) => { scene.remove(l.mesh); l.mesh.geometry.dispose(); });
    letters = measure(o.name, o.surface).map((g, i) => {
      size = g.size;
      const geo = new TextGeometry(g.ch, {
        font, size: g.size, depth: g.size * 0.16, curveSegments: 12,
        bevelEnabled: true, bevelThickness: g.size * 0.012, bevelSize: g.size * 0.006, bevelSegments: 3,
      });
      geo.computeBoundingBox();
      const b = geo.boundingBox!;
      const cx = (b.min.x + b.max.x) / 2;
      geo.translate(-cx, 0, -b.min.z); // pivot at the foot of the letter, back face on the page
      const mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true;
      mesh.position.set(g.x + cx, -g.baseline, 0);
      scene.add(mesh);
      return { mesh, cx: g.x + cx, cy: g.baseline - g.size * 0.35, enter: was[i]?.enter ?? 0.0001, lift: 0 };
    });
  };
  build();

  // ── the light ───────────────────────────────────────────────────────
  const light = { az: 200 * RAD, el: 34 * RAD };
  const aim = { az: light.az, el: light.el };
  const pointer = { x: -1, y: -1, inside: false, last: 0 };
  let scroll = 0;
  let idle = true;

  const place = () => {
    const R = 4000, c = new THREE.Vector3(W / 2, -H / 2, 0);
    key.position.set(c.x + R * Math.cos(light.el) * Math.cos(light.az), c.y + R * Math.cos(light.el) * Math.sin(light.az), R * Math.sin(light.el));
  };

  const onMove = (e: PointerEvent) => {
    const r = o.surface.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    pointer.inside = true; pointer.last = performance.now();
    // the light comes from the cursor's side of the name, lower the further out the cursor is
    const dx = pointer.x - W / 2, dy = -(pointer.y - H * 0.55);
    aim.az = Math.atan2(dy, dx);
    aim.el = (62 - 48 * clamp(Math.hypot(dx / (W / 2), dy / (H / 2)), 0, 1)) * RAD;
  };
  const onLeave = () => { pointer.inside = false; };
  o.host.addEventListener("pointermove", onMove);
  o.host.addEventListener("pointerdown", onMove);
  o.host.addEventListener("pointerleave", onLeave);

  // ── the loop ────────────────────────────────────────────────────────
  let visible = true, raf = 0, revealed = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); });
  io.observe(o.host);

  const step = (dt: number) => {
    const now = performance.now();
    idle = !pointer.inside || now - pointer.last > 2500;
    if (idle && !o.reduced) { aim.az += dt * 0.35; aim.el = 26 * RAD; }
    // ease the light towards its aim, the short way round
    let da = aim.az - light.az; da = Math.atan2(Math.sin(da), Math.cos(da));
    light.az += da * Math.min(1, dt * 3);
    light.el += (aim.el - light.el) * Math.min(1, dt * 3);
    place();

    const r = o.host.getBoundingClientRect();
    scroll = clamp(-r.top / Math.max(1, r.height), 0, 1);
    const reach = size * 1.1;
    letters.forEach((l, i) => {
      const d = pointer.inside && !o.reduced ? Math.hypot(pointer.x - l.cx, pointer.y - l.cy) : Infinity;
      const want = Math.exp(-((d / reach) ** 2)) * 1.6;
      l.lift += (want - l.lift) * Math.min(1, dt * 6);
      // leaving: letters sink back into the page, the right-hand ones first
      const sink = clamp(scroll * 1.6 - (1 - i / letters.length) * 0.4, 0, 1);
      l.mesh.scale.z = Math.max(0.0001, l.enter * (1 + l.lift) * (1 - sink));
      l.mesh.rotation.x = -l.lift * 0.06;
    });
    renderer.render(scene, camera);

    if (o.lensOpen()) {
      if (!xr) { xr = new THREE.WebGLRenderer({ canvas: o.xrayCanvas, alpha: true, antialias: true }); xr.setPixelRatio(renderer.getPixelRatio()); }
      xr.setSize(W, H, false);
      scene.overrideMaterial = wire; ground.visible = false;
      xr.render(scene, camera);
      scene.overrideMaterial = null; ground.visible = true;
    }
  };

  let last = performance.now();
  function loop() {
    cancelAnimationFrame(raf);
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(() => {
      const now = performance.now();
      step(Math.min(0.05, (now - last) / 1000));
      last = now;
      if (revealed && !o.reduced) loop();
    });
  }
  const onVisibility = () => { last = performance.now(); loop(); };
  document.addEventListener("visibilitychange", onVisibility);

  let width = o.host.clientWidth, frame = 0;
  const ro = new ResizeObserver(() => {
    if (o.host.clientWidth === width) return;
    width = o.host.clientWidth;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { build(); loop(); });
  });
  ro.observe(o.host);

  const redraw = () => { if (o.reduced) loop(); };
  window.addEventListener("scroll", redraw, { passive: true });
  o.host.addEventListener("pointermove", redraw);

  return {
    reveal(animate) {
      revealed = true;
      if (!animate) { letters.forEach((l) => { l.enter = 1; }); loop(); return; }
      // rise out of the page one letter after another, with a little overshoot
      const t0 = performance.now();
      letters.forEach((l, i) => {
        const start = i * 70;
        const tick = () => {
          const t = clamp((performance.now() - t0 - start) / 1100, 0, 1);
          const c = 1.6; // back-out easing
          l.enter = Math.max(0.0001, 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      // the light swings in from the left as they rise
      light.az = 170 * RAD; light.el = 14 * RAD; aim.az = 150 * RAD; aim.el = 30 * RAD;
      last = performance.now();
      loop();
    },
    destroy() {
      cancelAnimationFrame(raf); cancelAnimationFrame(frame);
      io.disconnect(); ro.disconnect();
      o.host.removeEventListener("pointermove", onMove);
      o.host.removeEventListener("pointerdown", onMove);
      o.host.removeEventListener("pointerleave", onLeave);
      o.host.removeEventListener("pointermove", redraw);
      window.removeEventListener("scroll", redraw);
      document.removeEventListener("visibilitychange", onVisibility);
      letters.forEach((l) => l.mesh.geometry.dispose());
      ground.geometry.dispose(); (ground.material as T.Material).dispose();
      scene.environment?.dispose();
      material.dispose(); wire.dispose();
      renderer.dispose(); xr?.dispose();
    },
  };
}
