"use client";

import { DiagramNode } from "./DiagramNode";
import { FlowRow, Zone } from "./DiagramPrimitives";
import { SystemDiagram } from "./SystemDiagram";
import type { DiagramMode } from "./DiagramContext";

interface ClipRelayDiagramProps {
  compact?: boolean;
  mode?: DiagramMode;
}

export function ClipRelayDiagram({ compact = false, mode = "normal" }: ClipRelayDiagramProps) {
  return (
    <SystemDiagram
      eyebrow="CLIPRELAY · Core Architecture"
      title="Decentralized Rust Mesh — Local-First Encrypted Routing"
      compact={compact}
      mode={mode}
      annotations={[
        { id: "mdns", text: "Zero-configuration discovery using mDNS. No central servers or accounts required." },
        { id: "rust",  text: "High-performance Rust core leveraging Tokio for asynchronous network I/O." },
        { id: "crypto", text: "E2E encryption using X25519 key exchange and ChaCha20-Poly1305 for data." },
      ]}
    >
      <div className={`grid min-w-0 gap-4 ${compact ? "" : "lg:grid-cols-2"}`}>

        {/* ① Peer Discovery & Handshake */}
        <Zone title="Discovery & Auth" caption="mDNS · X25519" tone="teal">
          <FlowRow accent="teal" delays={[0, 0.18]}>
            <DiagramNode
              label="mDNS Broadcast"
              subLabel="Local Network"
              tone="teal"
              nodeIndex={0}
              insight="Peers announce presence on the local subnet via multicast DNS."
            />
            <DiagramNode
              label="X25519 Handshake"
              subLabel="Key Exchange"
              tone="teal"
              nodeIndex={1}
              insight="Diffie-Hellman key agreement establishes a secure tunnel without certificates."
            />
            <DiagramNode
              label="Rust Core"
              subLabel="Tokio Async I/O"
              tone="teal"
              nodeIndex={2}
              insight="Event-driven daemon manages active peer connections concurrently."
            />
          </FlowRow>
        </Zone>

        {/* ② Secure Data Stream */}
        <Zone title="Secure Stream" caption="ChaCha20 · Chunking" tone="amber">
          <FlowRow accent="amber" delays={[0.08, 0.22]}>
            <DiagramNode
              label="Data Chunking"
              subLabel="64KB Segments"
              tone="amber"
              nodeIndex={0}
              insight="Files and clipboard data split into 64KB blocks for memory-efficient streaming."
            />
            <DiagramNode
              label="ChaCha20-Poly1305"
              subLabel="E2E Encryption"
              tone="amber"
              nodeIndex={1}
              insight="Each chunk is authenticated and encrypted before touching the network."
            />
            <DiagramNode
              label="Native UI"
              subLabel="Timeline Feed"
              tone="data"
              nodeIndex={2}
              insight="Decrypted payload rendered non-destructively in OS-native client interfaces."
            />
          </FlowRow>
        </Zone>

      </div>
    </SystemDiagram>
  );
}
