"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { Heartbeat, Database, ShieldCheck, Network, Broadcast, CloudArrowUp } from "@phosphor-icons/react";

interface NFStatus {
  name: string;
  url: string;
  status: "online" | "offline" | "checking";
  port: number;
  description: string;
  category: string;
  requests: number;
  avgLatency: number;
  uptime: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  NRF: Database,
  AUSF: ShieldCheck,
  UDM: Database,
  NSSF: Network,
  AMF: Broadcast,
  SMF: Heartbeat,
  UPF: CloudArrowUp,
};

export default function NetworkFunctionsPage() {
  const [nfStatuses, setNfStatuses] = useState<NFStatus[]>([
    {
      name: "NRF",
      url: "http://nrf:8080",
      status: "checking",
      port: 8082,
      description: "Network Repository Function",
      category: "Control Plane",
      requests: 1248,
      avgLatency: 12,
      uptime: "99.98%"
    },
    {
      name: "AUSF",
      url: "http://ausf:8080",
      status: "checking",
      port: 8081,
      description: "Authentication Server Function",
      category: "Control Plane",
      requests: 342,
      avgLatency: 18,
      uptime: "99.95%"
    },
    {
      name: "UDM",
      url: "http://udm:8080",
      status: "checking",
      port: 8084,
      description: "Unified Data Management",
      category: "Control Plane",
      requests: 876,
      avgLatency: 15,
      uptime: "99.99%"
    },
    {
      name: "NSSF",
      url: "http://nssf:8080",
      status: "checking",
      port: 8083,
      description: "Network Slice Selection Function",
      category: "Control Plane",
      requests: 128,
      avgLatency: 10,
      uptime: "100%"
    },
    {
      name: "AMF",
      url: "http://amf:8000",
      status: "checking",
      port: 8086,
      description: "Access and Mobility Function",
      category: "Control Plane",
      requests: 2156,
      avgLatency: 22,
      uptime: "99.92%"
    },
    {
      name: "SMF",
      url: "http://smf:8080",
      status: "checking",
      port: 8085,
      description: "Session Management Function",
      category: "Control Plane",
      requests: 1842,
      avgLatency: 25,
      uptime: "99.97%"
    },
    {
      name: "UPF",
      url: "http://upf:8080",
      status: "checking",
      port: 8087,
      description: "User Plane Function",
      category: "User Plane",
      requests: 8924,
      avgLatency: 8,
      uptime: "99.99%"
    },
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
  const totalRequests = nfStatuses.reduce((acc, nf) => acc + nf.requests, 0);
  const avgLatency = nfStatuses.reduce((acc, nf) => acc + nf.avgLatency, 0) / nfStatuses.length;

  return (
    <DashboardLayout activePage="network-functions">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            Network Functions
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Core network function monitoring and health status
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)" }}>
          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Online
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--status-success)" }} className="mono">
              {onlineCount}/{nfStatuses.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Functions Operational
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Total Requests
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {totalRequests.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Last Hour
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Avg Latency
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-xs)" }}>
              <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
                {avgLatency.toFixed(1)}
              </div>
              <div className="mono" style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
                ms
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Response Time
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              System Health
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--status-success)" }} className="mono">
              {((onlineCount / nfStatuses.length) * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Overall Status
            </div>
          </Card>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Control Plane
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-lg)" }}>
            {nfStatuses.filter(nf => nf.category === "Control Plane").map((nf) => {
              const Icon = iconMap[nf.name] || Heartbeat;
              return (
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
                          width: "48px",
                          height: "48px",
                          borderRadius: "var(--radius-lg)",
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Icon size={24} weight="duotone" color={nf.status === "online" ? "var(--accent-blue)" : "var(--text-muted)"} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "2px" }}>
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
                      gridTemplateColumns: "repeat(4, 1fr)",
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
                          Requests
                        </div>
                        <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {nf.requests}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                          Latency
                        </div>
                        <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {nf.avgLatency}ms
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                          Uptime
                        </div>
                        <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {nf.uptime}
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            User Plane
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-lg)" }}>
            {nfStatuses.filter(nf => nf.category === "User Plane").map((nf) => {
              const Icon = iconMap[nf.name] || Heartbeat;
              return (
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
                          width: "48px",
                          height: "48px",
                          borderRadius: "var(--radius-lg)",
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Icon size={24} weight="duotone" color={nf.status === "online" ? "var(--accent-blue)" : "var(--text-muted)"} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "2px" }}>
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
                      gridTemplateColumns: "repeat(4, 1fr)",
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
                          Requests
                        </div>
                        <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {nf.requests}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                          Latency
                        </div>
                        <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {nf.avgLatency}ms
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                          Uptime
                        </div>
                        <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {nf.uptime}
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
