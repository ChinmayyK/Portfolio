"use client";

import { DiagramNode } from "./DiagramNode";
import { FlowRow, Zone } from "./DiagramPrimitives";
import { SystemDiagram } from "./SystemDiagram";
import type { DiagramMode } from "./DiagramContext";

interface SketchToImageDiagramProps {
  compact?: boolean;
  mode?: DiagramMode;
}

export function SketchToImageDiagram({ compact = false, mode = "normal" }: SketchToImageDiagramProps) {
  return (
    <SystemDiagram
      eyebrow="Sketch → Image · Inference Pipeline"
      title="Hybrid local-cloud diffusion conditioned on sketch structure via ControlNet"
      compact={compact}
      mode={mode}
      annotations={[
        { id: "controlnet", text: "ControlNet conditions generation on the sketch's structural edges — preserving original composition." },
        { id: "router",     text: "The hybrid router probes local VRAM first. Cloud handover is seamless and invisible to the user." },
        { id: "stream",     text: "Progressive SSE chunks let users see partial output within the first second of inference." },
      ]}
    >
      <div className={`grid min-w-0 gap-4 ${compact ? "" : "lg:grid-cols-[1fr_1.6fr]"}`}>

        {/* ① Client input */}
        <Zone title="Input Layer" caption="Canvas · Edge map" tone="client">
          <FlowRow accent="sky" delays={[0]}>
            <DiagramNode
              label="Canvas Draw"
              subLabel="User Sketch"
              tone="sky"
              nodeIndex={0}
              insight="Raw strokes captured on HTML Canvas, ready for edge preprocessing."
            />
            <DiagramNode
              label="Edge Extractor"
              subLabel="HED / Canny"
              tone="client"
              nodeIndex={1}
              insight="Lightweight edge detector converts strokes into ControlNet's structural conditioning input."
            />
          </FlowRow>
        </Zone>

        {/* ② Inference + delivery */}
        <Zone title="Inference Layer" caption="Local GPU → Cloud fallback" tone="amber">
          <FlowRow accent="amber" delays={[0.1, 0.24]}>
            <DiagramNode
              label="Hybrid Router"
              subLabel="Local / Cloud"
              tone="amber"
              nodeIndex={0}
              insight="Checks local VRAM headroom. Forwards to cloud cluster transparently if insufficient."
            />
            <DiagramNode
              label="ControlNet + SD"
              subLabel="Diffusion Engine"
              tone="amber"
              nodeIndex={1}
              insight="Stable Diffusion with ControlNet receives both text prompt and edge map for conditioned generation."
            />
            <DiagramNode
              label="SSE Stream"
              subLabel="Progressive Output"
              tone="teal"
              nodeIndex={2}
              insight="Decoded byte chunks push to client via SSE. UI renders partial results progressively."
            />
          </FlowRow>
        </Zone>

      </div>
    </SystemDiagram>
  );
}

