"use client";

import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage?: string;
}

export default function DashboardLayout({ children, activePage }: DashboardLayoutProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activePage={activePage} />
      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          padding: "var(--spacing-2xl)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
