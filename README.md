# chinmaykudalkar.com

My portfolio, built with Next.js (App Router) and exported as a static site.

```bash
npm install
npm run dev      # local development
npm run build    # static export to out/
```

Content (projects, tools, email) lives in `src/lib/content.ts`; screenshots in `public/img/`.

## Deploying on Cloudflare

`wrangler.jsonc` deploys the static export in `out/` as Workers static assets, and runs `npm run build` first. With Workers Builds, keep the deploy command as `npx wrangler deploy`; no build command is needed. Node version comes from `.node-version` (22).

The previous Next.js site is kept at the `nextjs-site` tag.
