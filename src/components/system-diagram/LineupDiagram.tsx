"use client";

import { DiagramNode } from "./DiagramNode";
import { FlowRow, Zone } from "./DiagramPrimitives";
import { SystemDiagram } from "./SystemDiagram";
import type { DiagramMode } from "./DiagramContext";

interface LineupDiagramProps {
  compact?: boolean;
  mode?: DiagramMode;
}

export function LineupDiagram({ compact = false, mode = "normal" }: LineupDiagramProps) {
  return (
    <SystemDiagram
      eyebrow="LINEUP · System Architecture"
      title="Multi-tenant SaaS — async CRM sync with row-level isolation"
      compact={compact}
      mode={mode}
      annotations={[
        { id: "tenant", text: "Tenant context injected once at the auth guard — no service resolves it independently." },
        { id: "queue",  text: "BullMQ decouples CRM sync latency from the request cycle with exponential backoff." },
        { id: "db",     text: "Row-level PostgreSQL scoping enforces strict cross-tenant data isolation." },
      ]}
    >
      <div className={`grid min-w-0 gap-4 ${compact ? "" : "lg:grid-cols-2"}`}>

        {/* ① Synchronous request path */}
        <Zone title="Request Path" caption="JWT · Tenant context" tone="amber">
          <FlowRow accent="amber" delays={[0, 0.18]}>
            <DiagramNode
              label="App Router"
              subLabel="Next.js Edge"
              tone="amber"
              nodeIndex={0}
              insight="Handles routing and SSR, passing requests to the NestJS API layer."
            />
            <DiagramNode
              label="Auth Guard"
              subLabel="Tenant Inject"
              tone="amber"
              nodeIndex={1}
              insight="Validates JWT and injects tenant ID once — downstream services never re-resolve it."
            />
            <DiagramNode
              label="Service Layer"
              subLabel="Domain Logic"
              tone="amber"
              nodeIndex={2}
              insight="Business rules execute with tenant context already in scope."
            />
          </FlowRow>
        </Zone>

        {/* ② Async queue path */}
        <Zone title="Async Queue" caption="BullMQ · Zoho CRM" tone="teal">
          <FlowRow accent="teal" delays={[0.08, 0.22]}>
            <DiagramNode
              label="Queue Dispatch"
              subLabel="BullMQ Producer"
              tone="teal"
              nodeIndex={0}
              insight="CRM sync jobs dispatched after the sync response — zero latency impact on requests."
            />
            <DiagramNode
              label="Job Processor"
              subLabel="Worker Pool"
              tone="teal"
              nodeIndex={1}
              insight="Workers consume jobs with per-tenant isolation and exponential backoff on failure."
            />
            <DiagramNode
              label="PostgreSQL"
              subLabel="Row-Level Isolation"
              tone="data"
              nodeIndex={2}
              insight="All writes scoped to tenant_id. Row-level security enforced at the database."
            />
          </FlowRow>
        </Zone>

      </div>
    </SystemDiagram>
  );
}
