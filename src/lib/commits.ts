export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

// The contribution calendar, read once at build time from the live site's own /api/commits, so the year
// is there on first paint. The browser swaps in a fresher copy after load; a failed read leaves it empty.
export async function commitsAtBuild(): Promise<Day[]> {
  try {
    const r = await fetch("https://chinmaykudalkar.com/api/commits", { signal: AbortSignal.timeout(10000) });
    return r.ok ? ((await r.json()) as { contributions: Day[] }).contributions.slice(-365) : [];
  } catch {
    return [];
  }
}
