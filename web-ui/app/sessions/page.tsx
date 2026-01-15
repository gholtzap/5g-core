"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { ArrowUp, ArrowDown } from "@phosphor-icons/react";

interface Session {
  id: string;
  imsi: string;
  pduSessionId: number;
  dnn: string;
  ipAddress: string;
  snssai: string;
  uplink: number;
  downlink: number;
  duration: string;
  status: "active" | "idle";
}

export default function SessionsPage() {
  const [sessions] = useState<Session[]>([
    { id: "sess_001", imsi: "999700000000001", pduSessionId: 1, dnn: "internet", ipAddress: "10.60.0.1", snssai: "01:010203", uplink: 124.5, downlink: 842.3, duration: "02:14:32", status: "active" },
    { id: "sess_002", imsi: "999700000000002", pduSessionId: 1, dnn: "internet", ipAddress: "10.60.0.2", snssai: "01:010203", uplink: 89.2, downlink: 612.8, duration: "01:42:18", status: "active" },
    { id: "sess_003", imsi: "999700000000004", pduSessionId: 1, dnn: "internet", ipAddress: "10.60.0.3", snssai: "01:010203", uplink: 156.7, downlink: 1024.1, duration: "03:28:45", status: "active" },
    { id: "sess_004", imsi: "999700000000005", pduSessionId: 1, dnn: "ims", ipAddress: "10.60.0.4", snssai: "02:112233", uplink: 45.3, downlink: 203.6, duration: "00:58:12", status: "active" },
    { id: "sess_005", imsi: "999700000000001", pduSessionId: 2, dnn: "ims", ipAddress: "10.60.0.5", snssai: "02:112233", uplink: 12.1, downlink: 64.2, duration: "02:14:32", status: "idle" },
  ]);

  const activeSessions = sessions.filter(s => s.status === "active").length;
  const totalUplink = sessions.reduce((acc, s) => acc + s.uplink, 0);
  const totalDownlink = sessions.reduce((acc, s) => acc + s.downlink, 0);

  return (
    <DashboardLayout activePage="sessions">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            PDU Sessions
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Active data sessions and throughput monitoring
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)" }}>
          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Total Sessions
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {sessions.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              PDU Sessions
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Active
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--status-success)" }} className="mono">
              {activeSessions}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Active Now
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUp size={12} weight="bold" />
              Uplink
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-xs)" }}>
              <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
                {totalUplink.toFixed(1)}
              </div>
              <div className="mono" style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
                Mbps
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Total Upload
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowDown size={12} weight="bold" />
              Downlink
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-xs)" }}>
              <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
                {totalDownlink.toFixed(1)}
              </div>
              <div className="mono" style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
                Mbps
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Total Download
            </div>
          </Card>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Active Sessions
          </h2>
          <Card style={{ padding: 0 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 120px 120px 100px 100px 100px 100px",
              padding: "var(--spacing-md) var(--spacing-lg)",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: "11px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}>
              <div>IMSI</div>
              <div>PDU ID</div>
              <div>DNN</div>
              <div>IP Address</div>
              <div>S-NSSAI</div>
              <div>Uplink</div>
              <div>Downlink</div>
              <div>Duration</div>
            </div>
            {sessions.map((session, index) => (
              <div
                key={session.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 120px 120px 100px 100px 100px 100px",
                  padding: "var(--spacing-lg)",
                  borderBottom: index < sessions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  alignItems: "center",
                  transition: "background-color 150ms",
                  opacity: session.status === "idle" ? 0.6 : 1,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                  {session.imsi}
                </div>
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {session.pduSessionId}
                </div>
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {session.dnn}
                </div>
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {session.ipAddress}
                </div>
                <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {session.snssai}
                </div>
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                  {session.uplink} Mbps
                </div>
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                  {session.downlink} Mbps
                </div>
                <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {session.duration}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
