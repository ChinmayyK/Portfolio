"use client";

import { DiagramNode } from "./DiagramNode";
import { FlowRow, Zone } from "./DiagramPrimitives";
import { SystemDiagram } from "./SystemDiagram";
import type { DiagramMode } from "./DiagramContext";

interface DeployWatchDiagramProps {
  compact?: boolean;
  mode?: DiagramMode;
}

export function DeployWatchDiagram({ compact = false, mode = "normal" }: DeployWatchDiagramProps) {
  return (
    <SystemDiagram
      eyebrow="DeployWatch · Monitoring Architecture"
      title="High-frequency polling and automated incident response"
      compact={compact}
      mode={mode}
      annotations={[
        { id: "dispatcher", text: "BullMQ dispatcher worker claims APIs due for monitoring and queues jobs." },
        { id: "eval",       text: "Detection logic evaluates consecutive failures and latency to open incidents." },
        { id: "alert",      text: "Alert worker performs mock delivery (Email/Slack/Webhook) asynchronously." },
      ]}
    >
      <div className={`grid min-w-0 gap-4 ${compact ? "" : "lg:grid-cols-2"}`}>

        {/* ① Polling & Dispatch */}
        <Zone title="Polling Engine" caption="BullMQ · Scheduler" tone="amber">
          <FlowRow accent="amber" delays={[0, 0.18]}>
            <DiagramNode
              label="Dispatcher Worker"
              subLabel="Job Scheduler"
              tone="amber"
              nodeIndex={0}
              insight="Claims APIs whose nextCheckAt is due without tight coupling to API routes."
            />
            <DiagramNode
              label="Queue Monitoring"
              subLabel="BullMQ"
              tone="amber"
              nodeIndex={1}
              insight="Queues a monitoring job for each API that is due for a health check."
            />
            <DiagramNode
              label="HTTP Request"
              subLabel="Monitoring Worker"
              tone="amber"
              nodeIndex={2}
              insight="Performs the actual HTTP request and records the row in the check log."
            />
          </FlowRow>
        </Zone>

        {/* ② Incident & Alerting Pipeline */}
        <Zone title="Incident Pipeline" caption="Detection · Alerts" tone="teal">
          <FlowRow accent="teal" delays={[0.08, 0.22]}>
            <DiagramNode
              label="Detection Logic"
              subLabel="Threshold Eval"
              tone="teal"
              nodeIndex={0}
              insight="Evaluates latency and consecutive failures to determine if an incident occurs."
            />
            <DiagramNode
              label="Incident Management"
              subLabel="PostgreSQL"
              tone="data"
              nodeIndex={1}
              insight="Opens or updates incidents and logs events, separating state from timeline."
            />
            <DiagramNode
              label="Alert Worker"
              subLabel="Notification"
              tone="teal"
              nodeIndex={2}
              insight="Fires alerts to email, Slack, or webhook channels decoupled from the core check."
            />
          </FlowRow>
        </Zone>

      </div>
    </SystemDiagram>
  );
}

