"use client";

import { House, ChartLine, Users, Database, ChartLineUp, IdentificationCard } from "@phosphor-icons/react";

interface SidebarProps {
  activePage?: string;
}

export default function Sidebar({ activePage = "dashboard" }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: House },
    { id: "network-functions", label: "Network Functions", icon: ChartLine },
    { id: "subscribers", label: "Subscribers", icon: Users },
    { id: "subscriber-profiles", label: "Subscriber Profiles", icon: IdentificationCard },
    { id: "sessions", label: "Sessions", icon: Database },
    { id: "metrics", label: "Metrics", icon: ChartLineUp },
  ];

  return (
    <aside
      style={{
        width: "240px",
        height: "100vh",
        backgroundColor: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div
        style={{
          padding: "var(--spacing-xl)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          5G Core Network
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "var(--spacing-xs)",
          }}
        >
          Network Management
        </p>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "var(--spacing-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xs)",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;

          return (
            <a
              key={item.id}
              href={`/${item.id === "dashboard" ? "" : item.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-md)",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "var(--radius-md)",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                transition: "all 150ms cubic-bezier(0.25, 1, 0.5, 1)",
                border: isActive ? "1px solid var(--border)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={18} weight={isActive ? "duotone" : "regular"} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div
        style={{
          padding: "var(--spacing-lg)",
          borderTop: "1px solid var(--border)",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
              Admin
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Network Operator
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
