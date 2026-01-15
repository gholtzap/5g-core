"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import LogsViewer from "@/components/LogsViewer";
import type { NetworkFunction } from "@/types/logs";

const networkFunctions: NetworkFunction[] = [
  { id: "nrf", name: "NRF", container: "nrf" },
  { id: "ausf", name: "AUSF", container: "ausf" },
  { id: "udm", name: "UDM", container: "udm" },
  { id: "nssf", name: "NSSF", container: "nssf" },
  { id: "amf", name: "AMF", container: "amf" },
  { id: "smf", name: "SMF", container: "smf" },
  { id: "upf", name: "UPF", container: "upf" },
];

export default function LogsPage() {
  const [selectedNF, setSelectedNF] = useState<NetworkFunction>(networkFunctions[0]);

  return (
    <DashboardLayout activePage="logs">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)", height: "calc(100vh - 80px)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            Live Logs
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Real-time log streaming from network functions
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
          {networkFunctions.map((nf) => (
            <button
              key={nf.id}
              onClick={() => setSelectedNF(nf)}
              style={{
                padding: "var(--spacing-sm) var(--spacing-lg)",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                backgroundColor: selectedNF.id === nf.id ? "var(--accent-blue)" : "var(--bg-primary)",
                color: selectedNF.id === nf.id ? "white" : "var(--text-primary)",
                cursor: "pointer",
                transition: "all 150ms cubic-bezier(0.25, 1, 0.5, 1)",
              }}
              onMouseEnter={(e) => {
                if (selectedNF.id !== nf.id) {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedNF.id !== nf.id) {
                  e.currentTarget.style.backgroundColor = "var(--bg-primary)";
                }
              }}
            >
              {nf.name}
            </button>
          ))}
        </div>

        <Card style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            {selectedNF.name} Logs
          </h2>
          <LogsViewer container={selectedNF.container} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
