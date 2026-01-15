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
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("error") || lowerMessage.includes("fatal")) return "error";
    if (lowerMessage.includes("warn")) return "warn";
    if (lowerMessage.includes("debug")) return "debug";
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

  const getLogColor = (message: string): string => {
    const level = detectLogLevel(message);
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
          filteredLogs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: "4px 0",
                borderBottom: "1px solid var(--border-subtle)",
                wordWrap: "break-word",
                color: getLogColor(log.message),
              }}
            >
              <span style={{ color: "var(--text-muted)", marginRight: "8px" }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {log.message}
            </div>
          ))
        )}
      </div>

      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </div>
  );
}
