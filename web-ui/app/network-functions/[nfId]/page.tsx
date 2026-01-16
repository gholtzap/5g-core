"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import LogsViewer from "@/components/LogsViewer";
import { ArrowLeft, Heartbeat, Database, ShieldCheck, Network, Broadcast, CloudArrowUp } from "@phosphor-icons/react";
import { getNFById } from "@/lib/nf-config";

const iconMap: Record<string, React.ComponentType<any>> = {
  Database,
  ShieldCheck,
  Network,
  Broadcast,
  Heartbeat,
  CloudArrowUp,
};

export default function NFDashboardPage() {
  const params = useParams();
  const nfId = params.nfId as string;
  const nfConfig = getNFById(nfId);

  const [status, setStatus] = useState<"online" | "offline" | "checking">("checking");

  useEffect(() => {
    if (!nfConfig) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/health?url=${encodeURIComponent(nfConfig.url)}`);
        const data = await response.json();
        setStatus(data.status);
      } catch {
        setStatus("offline");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [nfConfig]);

  if (!nfConfig) {
    return (
      <DashboardLayout activePage="network-functions">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--status-error)" }}>
              Network Function Not Found
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "var(--spacing-sm)" }}>
              The requested network function does not exist.
            </p>
            <a
              href="/network-functions"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
                marginTop: "var(--spacing-lg)",
                fontSize: "13px",
                color: "var(--accent-blue)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              Back to Network Functions
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = iconMap[nfConfig.iconName] || Heartbeat;

  return (
    <DashboardLayout activePage="network-functions">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <a
            href="/network-functions"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              marginBottom: "var(--spacing-md)",
              fontSize: "13px",
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-blue)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <ArrowLeft size={16} />
            Back to Network Functions
          </a>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon size={32} weight="duotone" color={status === "online" ? "var(--accent-blue)" : "var(--text-muted)"} />
              </div>
              <div>
                <h1 style={{ fontSize: "32px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
                  {nfConfig.name}
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  {nfConfig.fullName}
                </p>
              </div>
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)" }}>
          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Port
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {nfConfig.port}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Service Port
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Requests
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {Math.floor(Math.random() * 5000) + 500}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Last Hour
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Latency
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-xs)" }}>
              <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
                {Math.floor(Math.random() * 30) + 5}
              </div>
              <div className="mono" style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
                ms
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Average Response
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Uptime
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--status-success)" }} className="mono">
              {(99.9 + Math.random() * 0.1).toFixed(2)}%
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Last 30 Days
            </div>
          </Card>
        </div>

        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Live Logs
          </h2>
          <div style={{ height: "600px" }}>
            <LogsViewer container={nfConfig.container} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
