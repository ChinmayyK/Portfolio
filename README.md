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
- `src/components/hero/Sunlight.tsx`, `sun.ts`, `shadow.ts`: the hero's type casts a shadow from where the sun (or, after dark, the moon) is over Mumbai at that moment, computed in the browser. The dial lets you drag the sun through the day.
- `src/styles/`: component styles; tokens are in `src/app/globals.css`.

Pages stay server-rendered and declare motion with data attributes (`data-split`, `data-reveal`, `data-stagger`, `data-parallax`, `data-draw`). One client component, `Choreographer`, wires them up on each route. Everything respects `prefers-reduced-motion`.

## Deploying on Cloudflare

`wrangler.jsonc` deploys the static export in `out/` as Workers static assets, and runs `npm run build` first. With Workers Builds, keep the deploy command as `npx wrangler deploy`; no build command is needed. Node version comes from `.node-version` (22).

The previous Next.js site is kept at the `nextjs-site` tag.
