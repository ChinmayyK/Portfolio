/** The visitor's own device, when Link All runs on it. iOS has no app yet, so it gets the default scene. */
export type Visitor = { side: "mac" | "phone"; name: string; os: string; win?: boolean };
export function detect(): Visitor | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return null;
  if (/Android/.test(ua)) return { side: "phone", name: /Mobile/.test(ua) ? "your Android phone" : "your Android tablet", os: "Android" };
  if (/Windows/.test(ua)) return { side: "mac", name: "your Windows PC", os: "Windows", win: true };
  if (/Macintosh/.test(ua)) return { side: "mac", name: "your Mac", os: "macOS" };
  if (/Linux/.test(ua) && !/CrOS/.test(ua)) return { side: "mac", name: "your Linux machine", os: "Linux" };
  return null;
}
