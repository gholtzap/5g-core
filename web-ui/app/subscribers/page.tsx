"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { DeviceMobile, WifiHigh } from "@phosphor-icons/react";

interface Subscriber {
  imsi: string;
  imei: string;
  status: "online" | "offline";
  registeredAt: string;
  lastSeen: string;
  tac: string;
  cellId: string;
}

export default function SubscribersPage() {
  const [subscribers] = useState<Subscriber[]>([
    { imsi: "999700000000001", imei: "353490000000001", status: "online", registeredAt: "2026-01-14 10:23:15", lastSeen: "2026-01-14 14:32:41", tac: "000001", cellId: "0x01" },
    { imsi: "999700000000002", imei: "353490000000002", status: "online", registeredAt: "2026-01-14 09:15:22", lastSeen: "2026-01-14 14:32:38", tac: "000001", cellId: "0x01" },
    { imsi: "999700000000003", imei: "353490000000003", status: "offline", registeredAt: "2026-01-13 16:42:33", lastSeen: "2026-01-14 08:21:19", tac: "000001", cellId: "0x01" },
    { imsi: "999700000000004", imei: "353490000000004", status: "online", registeredAt: "2026-01-14 11:08:47", lastSeen: "2026-01-14 14:32:40", tac: "000001", cellId: "0x02" },
    { imsi: "999700000000005", imei: "353490000000005", status: "online", registeredAt: "2026-01-14 08:33:12", lastSeen: "2026-01-14 14:32:39", tac: "000001", cellId: "0x02" },
  ]);

  const onlineCount = subscribers.filter(s => s.status === "online").length;

  return (
    <DashboardLayout activePage="subscribers">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            Subscribers
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Registered user equipment and connection status
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Total Subscribers
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {subscribers.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Registered UEs
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Active Now
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--status-success)" }} className="mono">
              {onlineCount}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Connected Devices
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Connection Rate
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {Math.round((onlineCount / subscribers.length) * 100)}%
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Active vs Total
            </div>
          </Card>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Registered Devices
          </h2>
          <Card style={{ padding: 0 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 1fr 120px 140px 100px 100px",
              padding: "var(--spacing-md) var(--spacing-lg)",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: "11px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}>
              <div></div>
              <div>IMSI</div>
              <div>IMEI</div>
              <div>Status</div>
              <div>Registered At</div>
              <div>TAC</div>
              <div>Cell ID</div>
            </div>
            {subscribers.map((subscriber, index) => (
              <div
                key={subscriber.imsi}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 1fr 120px 140px 100px 100px",
                  padding: "var(--spacing-lg)",
                  borderBottom: index < subscribers.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  alignItems: "center",
                  transition: "background-color 150ms",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {subscriber.status === "online" ? (
                    <WifiHigh size={16} weight="duotone" color="var(--status-success)" />
                  ) : (
                    <DeviceMobile size={16} weight="duotone" color="var(--text-muted)" />
                  )}
                </div>
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                  {subscriber.imsi}
                </div>
                <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {subscriber.imei}
                </div>
                <div>
                  <StatusBadge status={subscriber.status} />
                </div>
                <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {subscriber.registeredAt}
                </div>
                <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {subscriber.tac}
                </div>
                <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {subscriber.cellId}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
