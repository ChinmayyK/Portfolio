export type Repo = {
  stars: number;
  forks: number;
  commits: number;
  releases: number;
  downloads: number;
  latest: { tag: string; date: string } | null;
  license: string | null;
  pushed: string;
  /** share of the code by language, biggest first */
  langs: [name: string, share: number][];
};

// Link All's GitHub numbers, read once at build time from the live site's own /api/repo (worker/index.js),
// so they're there on first paint. The browser swaps in a fresher copy after load; a failed read leaves them out.
export async function repoAtBuild(): Promise<Repo | null> {
  try {
    const r = await fetch("https://chinmaykudalkar.com/api/repo", { signal: AbortSignal.timeout(10000) });
    return r.ok ? ((await r.json()) as Repo) : null;
  } catch {
    return null;
  }
}
