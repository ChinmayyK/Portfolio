import { ImageResponse } from "next/og";

// Home-screen icon for iOS: the same mark as icon.svg, as a PNG.
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#141413", position: "relative" }}>
        <div style={{ position: "absolute", left: 62, top: 62, width: 90, height: 90, borderRadius: 90, background: "#D4F25A", display: "flex" }} />
      </div>
    ),
    size,
  );
}
