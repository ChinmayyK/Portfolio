"use client";

import { DiagramNode } from "./DiagramNode";
import { FlowRow, Zone } from "./DiagramPrimitives";
import { SystemDiagram } from "./SystemDiagram";
import type { DiagramMode } from "./DiagramContext";

interface BlockvaultDiagramProps {
  compact?: boolean;
  mode?: DiagramMode;
}

export function BlockvaultDiagram({ compact = false, mode = "normal" }: BlockvaultDiagramProps) {
  return (
    <SystemDiagram
      eyebrow="BlockVault · Security Pipeline"
      title="Client-side encryption with ZK proof and verifiable decentralized storage"
      compact={compact}
      mode={mode}
      annotations={[
        { id: "e2ee",   text: "AES-256 encryption runs client-side — plaintext never crosses the trust boundary." },
        { id: "zk",     text: "ZK proofs let the server verify compliance without reading document contents." },
        { id: "breach", text: "A server compromise yields ciphertext and proofs only — no readable user data." },
      ]}
    >
      <div className={`grid min-w-0 gap-4 ${compact ? "" : "lg:grid-cols-[1.4fr_1fr]"}`}>

        {/* ① Client trusted boundary */}
        <Zone title="Client Boundary" caption="Encryption before egress" tone="client">
          <FlowRow accent="sky" delays={[0, 0.2]}>
            <DiagramNode
              label="User Upload"
              subLabel="Document Intake"
              tone="sky"
              nodeIndex={0}
              insight="Raw document handled entirely client-side before any network call is made."
            />
            <DiagramNode
              label="AES-256 Encrypt"
              subLabel="Client-Side Crypto"
              tone="client"
              nodeIndex={1}
              insight="Encryption runs in the browser. Private keys never leave the client boundary."
            />
            <DiagramNode
              label="ZK Proof"
              subLabel="Groth16 Circuit"
              tone="client"
              nodeIndex={2}
              insight="Proof artifacts travel with ciphertext. Sensitive content stays unreadable throughout."
            />
          </FlowRow>
        </Zone>

        {/* ② External verification zone */}
        <Zone title="Verification Layer" caption="Ciphertext + proofs only" tone="external">
          <FlowRow accent="teal" delays={[0.3]}>
            <DiagramNode
              label="IPFS Storage"
              subLabel="Decentralized"
              tone="external"
              nodeIndex={0}
              insight="Encrypted chunks distributed independently — no single point of failure."
            />
            <DiagramNode
              label="Blockchain Anchor"
              subLabel="Immutable Audit"
              tone="data"
              nodeIndex={1}
              insight="The chain stores only a compact verification anchor, not the document."
            />
          </FlowRow>
        </Zone>

      </div>
    </SystemDiagram>
  );
}
