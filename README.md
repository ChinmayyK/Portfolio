# chinmaykudalkar.com

My portfolio. Next.js (App Router, static export), TypeScript, Tailwind CSS v4, GSAP with ScrollTrigger and SplitText, and Lenis.

```bash
npm install
npm run dev        # http://localhost:3006
npm run build      # static export to out/
npm run lint
npm run typecheck
```

## Where things live

- `src/content/site.ts`: name, links, experience, tools.
- `src/content/projects.ts`: projects and the case-study text, which renders `/work/[slug]`.
- `public/img/`: real product captures (light theme).
- `src/components/chrome/`: shared frame (menu, page transitions, smooth scroll, motion choreographer, cursor, magnetic buttons).
- `src/components/hero/Hero.tsx`: the hero and its inspector lens.
- `src/components/hero/stage.ts`: once the page has drawn (on phones, on the first touch or scroll), three.js turns the name into extruded 3D letters at exactly the HTML letters' positions, lit from the cursor. `public/fonts/name.json` holds the name's glyphs; regenerate it with `npm run name-font`.
- `src/styles/`: component styles; tokens are in `src/app/globals.css`.

Pages stay server-rendered and declare motion with data attributes (`data-split`, `data-reveal`, `data-stagger`, `data-parallax`, `data-draw`). One client component, `Choreographer`, wires them up on each route. Everything respects `prefers-reduced-motion`.

## Deploying on Cloudflare

`wrangler.jsonc` deploys the static export in `out/` as Workers static assets, and runs `npm run build` first. With Workers Builds, keep the deploy command as `npx wrangler deploy`; no build command is needed. Node version comes from `.node-version` (22).

The previous Next.js site is kept at the `nextjs-site` tag.
