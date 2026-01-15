"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlass, Trash } from "@phosphor-icons/react";
import type { LogEntry, LogLevel } from "@/types/logs";

interface LogsViewerProps {
  container: string;
}

export default function LogsViewer({ container }: LogsViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState<LogLevel>("all");
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container) return;

    setLogs([]);

    const eventSource = new EventSource(`/api/logs?container=${container}`);

    eventSource.onmessage = (event) => {
      const logEntry: LogEntry = JSON.parse(event.data);
      setLogs((prevLogs) => [logEntry, ...prevLogs.slice(0, 499)]);
    };

    eventSource.onerror = () => {
      console.error("EventSource error");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [container]);

  const detectLogLevel = (message: string): string => {
    const upperMessage = message.toUpperCase();
    if (
      upperMessage.includes("ERROR") ||
      upperMessage.includes("FATAL") ||
      upperMessage.includes("CRIT") ||
      upperMessage.includes("[E]") ||
      /\bERR\b/.test(upperMessage)
    )
      return "error";
    if (
      upperMessage.includes("WARN") ||
      upperMessage.includes("WARNING") ||
      upperMessage.includes("[W]")
    )
      return "warn";
    if (
      upperMessage.includes("DEBUG") ||
      upperMessage.includes("[D]") ||
      upperMessage.includes("TRACE")
    )
      return "debug";
    if (upperMessage.includes("INFO") || upperMessage.includes("[I]")) return "info";
    return "info";
  };

  const filteredLogs = logs.filter((log) => {
    const messageMatch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const detectedLevel = detectLogLevel(log.message);
    const levelMatch = logLevel === "all" || detectedLevel === logLevel;
    return messageMatch && levelMatch;
  });

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelBadgeStyle = (level: string) => {
    const baseStyle = {
      display: "inline-block",
      padding: "2px 6px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: 600,
      marginRight: "8px",
      minWidth: "45px",
      textAlign: "center" as const,
    };

    switch (level) {
      case "error":
        return {
          ...baseStyle,
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          color: "var(--status-error)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        };
      case "warn":
        return {
          ...baseStyle,
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          color: "var(--status-warning)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
        };
      case "debug":
        return {
          ...baseStyle,
          backgroundColor: "rgba(107, 114, 128, 0.15)",
          color: "var(--text-muted)",
          border: "1px solid rgba(107, 114, 128, 0.3)",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          color: "var(--accent-blue)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
        };
    }
  };

  const getLogColor = (level: string): string => {
    switch (level) {
      case "error":
        return "var(--status-error)";
      case "warn":
        return "var(--status-warning)";
      case "debug":
        return "var(--text-muted)";
      default:
        return "var(--text-primary)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "var(--spacing-lg)" }}>
      <div style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <MagnifyingGlass
            size={16}
            style={{
              position: "absolute",
              left: "var(--spacing-md)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 36px",
              fontSize: "13px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <select
          value={logLevel}
          onChange={(e) => setLogLevel(e.target.value as LogLevel)}
          style={{
            padding: "var(--spacing-sm) var(--spacing-md)",
            fontSize: "13px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        >
          <option value="all">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warn</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>

        <button
          onClick={clearLogs}
          style={{
            padding: "var(--spacing-sm) var(--spacing-md)",
            fontSize: "13px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          <Trash size={16} />
          Clear
        </button>
      </div>

      <div
        ref={logsContainerRef}
        style={{
          flex: 1,
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--spacing-md)",
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "var(--spacing-xl)" }}>
            {logs.length === 0 ? "Waiting for logs..." : "No logs match the current filters"}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const level = detectLogLevel(log.message);
            return (
              <div
                key={index}
                style={{
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  wordWrap: "break-word",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "11px", minWidth: "70px" }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span style={getLevelBadgeStyle(level)}>{level.toUpperCase()}</span>
                <span style={{ flex: 1, color: getLogColor(level) }}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>

      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </div>
  );
}
