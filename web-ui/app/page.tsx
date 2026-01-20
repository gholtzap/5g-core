"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle, XCircle, Circle } from "@phosphor-icons/react";

interface NFStatus {
  name: string;
  url: string;
  status: "online" | "offline" | "checking";
  port: number;
  description: string;
}

export default function Home() {
  const [nfStatuses, setNfStatuses] = useState<NFStatus[]>([
    { name: "NRF", url: "http://nrf:8080", status: "checking", port: 8082, description: "Network Repository Function" },
    { name: "AUSF", url: "http://ausf:8080", status: "checking", port: 8081, description: "Authentication Server Function" },
    { name: "UDM", url: "http://udm:8080", status: "checking", port: 8084, description: "Unified Data Management" },
    { name: "NSSF", url: "http://nssf:8080", status: "checking", port: 8083, description: "Network Slice Selection Function" },
    { name: "SCP", url: "http://scp:7777", status: "checking", port: 8088, description: "Service Communication Proxy" },
    { name: "AMF", url: "http://amf:8000", status: "checking", port: 8086, description: "Access and Mobility Function" },
    { name: "SMF", url: "http://smf:8080", status: "checking", port: 8085, description: "Session Management Function" },
    { name: "UPF", url: "http://upf:8080", status: "checking", port: 8087, description: "User Plane Function" },
  ]);

  useEffect(() => {
    const checkStatuses = async () => {
      const updatedStatuses = await Promise.all(
        nfStatuses.map(async (nf) => {
          try {
            const response = await fetch(`/api/health?url=${encodeURIComponent(nf.url)}`);
            const data = await response.json();
            return { ...nf, status: data.status };
          } catch {
            return { ...nf, status: "offline" as const };
          }
        })
      );
      setNfStatuses(updatedStatuses);
    };

    checkStatuses();
    const interval = setInterval(checkStatuses, 10000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = nfStatuses.filter(nf => nf.status === "online").length;
  const offlineCount = nfStatuses.filter(nf => nf.status === "offline").length;

  return (
    <DashboardLayout activePage="dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Real-time network status and monitoring
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Total Functions
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {nfStatuses.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Network Functions
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Online
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--status-success)" }} className="mono">
              {onlineCount}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Functions Operational
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Offline
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: offlineCount > 0 ? "var(--status-error)" : "var(--text-muted)" }} className="mono">
              {offlineCount}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Functions Down
            </div>
          </Card>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Network Functions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-lg)" }}>
            {nfStatuses.map((nf) => (
              <a
                key={nf.name}
                href={`/network-functions/${nf.name.toLowerCase()}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  transition: "transform 150ms",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--radius-lg)",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {nf.status === "online" && <CheckCircle size={20} weight="duotone" color="var(--status-success)" />}
                        {nf.status === "offline" && <XCircle size={20} weight="duotone" color="var(--status-error)" />}
                        {nf.status === "checking" && <Circle size={20} weight="duotone" color="var(--status-neutral)" />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "2px" }}>
                          {nf.name}
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {nf.description}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={nf.status} />
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--spacing-md)",
                    paddingTop: "var(--spacing-md)",
                    borderTop: "1px solid var(--border-subtle)",
                  }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        Port
                      </div>
                      <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                        {nf.port}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                        Endpoint
                      </div>
                      <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        localhost
                      </div>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Network Configuration
          </h2>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-xl)" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-sm)" }}>
                  MCC
                </div>
                <div className="mono" style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>
                  999
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
                  Mobile Country Code
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-sm)" }}>
                  MNC
                </div>
                <div className="mono" style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>
                  70
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
                  Mobile Network Code
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-sm)" }}>
                  PLMN
                </div>
                <div className="mono" style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>
                  99970
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
                  Public Land Mobile Network
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-sm)" }}>
                  TAC
                </div>
                <div className="mono" style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>
                  000001
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
                  Tracking Area Code
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
