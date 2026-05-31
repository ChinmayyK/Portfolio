"use client";

import { DiagramNode } from "./DiagramNode";
import { FlowRow, Zone } from "./DiagramPrimitives";
import { SystemDiagram } from "./SystemDiagram";
import type { DiagramMode } from "./DiagramContext";

interface DeskdropDiagramProps {
  compact?: boolean;
  mode?: DiagramMode;
}

export function DeskdropDiagram({ compact = false, mode = "normal" }: DeskdropDiagramProps) {
  return (
    <SystemDiagram
      eyebrow="DESKDROP · Core Architecture"
      title="Decentralized Rust Mesh — Local-First Encrypted Routing"
      compact={compact}
      mode={mode}
      annotations={[
        { id: "mdns", text: "Zero-configuration discovery using local mDNS subnets. No central servers or accounts." },
        { id: "continuity", text: "Direct TCP raw frame streaming for camera continuity and hardware telemetry." },
        { id: "crypto", text: "E2E encryption using X25519 key exchange and ChaCha20-Poly1305 for all data chunks." },
      ]}
    >
      <div className={`grid min-w-0 gap-4 ${compact ? "" : "lg:grid-cols-3"}`}>

        {/* ① Peer Discovery & Cryptographic Trust */}
        <Zone title="Discovery & Trust" caption="mDNS · X25519" tone="teal">
          <FlowRow accent="teal" delays={[0, 0.15, 0.3]}>
            <DiagramNode
              label="mDNS Discovery"
              subLabel="Local Subnet"
              tone="teal"
              nodeIndex={0}
              insight="Peers announce presence on the local subnet via multicast DNS, resolving Wi-Fi & hotspots."
            />
            <DiagramNode
              label="X25519 Handshake"
              subLabel="Trust-on-First-Use"
              tone="teal"
              nodeIndex={1}
              insight="Diffie-Hellman key agreement establishes a secure tunnel and registers public keys locally."
            />
            <DiagramNode
              label="Tokio Daemon"
              subLabel="Rust Background Service"
              tone="teal"
              nodeIndex={2}
              insight="Rust core service runs persistently in background, managing active peer reconnections."
            />
          </FlowRow>
        </Zone>

        {/* ② Secure Syncing & Transfer */}
        <Zone title="Secure Syncing" caption="ChaCha20 · 256KB Chunking" tone="amber">
          <FlowRow accent="amber" delays={[0.05, 0.2, 0.35]}>
            <DiagramNode
              label="256KB Chunking"
              subLabel="Stream Segmenter"
              tone="amber"
              nodeIndex={0}
              insight="Files and large clip payloads are segment-chunked to prevent memory spikes in stream transfers."
            />
            <DiagramNode
              label="ChaCha20-Poly1305"
              subLabel="Subnet E2EE"
              tone="amber"
              nodeIndex={1}
              insight="High-throughput AEAD encryption protects packets before they are written to raw TCP sockets."
            />
            <DiagramNode
              label="Sandboxed Feed"
              subLabel="Timeline UI"
              tone="data"
              nodeIndex={2}
              insight="Avoids silent clipboard hijacking by isolating incoming clips inside a sandboxed Timeline feed."
            />
          </FlowRow>
        </Zone>

        {/* ③ Hardware Continuity Layers */}
        <Zone title="Continuity Layers" caption="TCP Stream · Telemetry" tone="client">
          <FlowRow accent="sky" delays={[0.1, 0.25, 0.4]}>
            <DiagramNode
              label="Camera Stream"
              subLabel="Raw TCP Frame Buffers"
              tone="sky"
              nodeIndex={0}
              insight="Driverless real-time frame streaming bypasses the cloud, routing mobile lens directly to Mac."
            />
            <DiagramNode
              label="Phone Telemetry"
              subLabel="Android Hooks"
              tone="client"
              nodeIndex={1}
              insight="Listens for OS-level telephony API state changes to broadcast battery and call events."
            />
            <DiagramNode
              label="macOS Banners"
              subLabel="SwiftUI Bindings"
              tone="client"
              nodeIndex={2}
              insight="Renders native incoming call HUDs and charging milestone banners on user desktop."
            />
          </FlowRow>
        </Zone>

      </div>
    </SystemDiagram>
  );
}
