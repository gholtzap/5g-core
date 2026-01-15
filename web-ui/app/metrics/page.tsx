"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";

interface Metric {
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Active Sessions", value: 142, unit: "", change: 8.2, trend: "up" },
    { label: "Throughput", value: 1248, unit: "Mbps", change: -3.1, trend: "down" },
    { label: "Registered UEs", value: 89, unit: "", change: 12.5, trend: "up" },
    { label: "PDU Sessions", value: 156, unit: "", change: 5.3, trend: "up" },
    { label: "Average Latency", value: 28, unit: "ms", change: -2.4, trend: "down" },
    { label: "Network Load", value: 64, unit: "%", change: 1.8, trend: "up" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        change: (Math.random() - 0.5) * 10,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout activePage="metrics">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            Network Metrics
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Real-time performance monitoring and analytics
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-md)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                  {metric.label}
                </div>
                <div style={{
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: metric.trend === "up" ? "var(--status-success-subtle)" : metric.trend === "down" ? "var(--status-error-subtle)" : "var(--status-neutral-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  {metric.trend === "up" && <TrendUp size={12} color="var(--status-success)" />}
                  {metric.trend === "down" && <TrendDown size={12} color="var(--status-error)" />}
                  {metric.trend === "stable" && <Minus size={12} color="var(--status-neutral)" />}
                  <span className="mono" style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: metric.trend === "up" ? "var(--status-success)" : metric.trend === "down" ? "var(--status-error)" : "var(--status-neutral)"
                  }}>
                    {metric.change > 0 ? "+" : ""}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-xs)" }}>
                <div className="mono" style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {Math.round(metric.value)}
                </div>
                {metric.unit && (
                  <div className="mono" style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
                    {metric.unit}
                  </div>
                )}
              </div>
              <div style={{
                height: "40px",
                marginTop: "var(--spacing-md)",
                display: "flex",
                alignItems: "flex-end",
                gap: "2px",
              }}>
                {[...Array(20)].map((_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${height}%`,
                        backgroundColor: "var(--accent-blue-subtle)",
                        borderRadius: "2px",
                        transition: "height 300ms ease",
                      }}
                    />
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Real-time Activity
          </h2>
          <Card>
            <div style={{
              height: "240px",
              display: "flex",
              alignItems: "flex-end",
              gap: "4px",
              padding: "var(--spacing-lg) 0",
            }}>
              {[...Array(60)].map((_, i) => {
                const height = 20 + Math.random() * 80;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      backgroundColor: i > 50 ? "var(--accent-blue)" : "var(--accent-blue-subtle)",
                      borderRadius: "2px",
                      transition: "all 300ms ease",
                    }}
                  />
                );
              })}
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "var(--spacing-lg)",
              paddingTop: "var(--spacing-lg)",
              borderTop: "1px solid var(--border-subtle)",
            }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Peak
                </div>
                <div className="mono" style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  1842 Mbps
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Average
                </div>
                <div className="mono" style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  1248 Mbps
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Minimum
                </div>
                <div className="mono" style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  892 Mbps
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
