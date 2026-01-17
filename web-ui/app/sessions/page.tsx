"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { ArrowUp, ArrowDown, X } from "@phosphor-icons/react";
import { Session } from "@/types/session";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this PDU session?')) {
      return;
    }

    try {
      setTerminating(sessionId);
      const response = await fetch('/api/sessions/terminate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smContextRef: sessionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to terminate session');
      }

      await fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to terminate session');
      console.error('Error terminating session:', err);
    } finally {
      setTerminating(null);
    }
  };

  const formatSnssai = (session: Session) => {
    const sst = session.s_nssai?.sst?.toString().padStart(2, '0') || '01';
    const sd = session.s_nssai?.sd || '010203';
    return `${sst}:${sd}`;
  };

  const formatIpAddress = (session: Session) => {
    return session.pdu_address?.ipv4 || session.pdu_address?.ipv6 || '-';
  };

  const formatDuration = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now.getTime() - created.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeSessions = sessions.filter(s => s.state === 'Active' || s.state === 'ActivePending').length;

  return (
    <DashboardLayout activePage="sessions">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            PDU Sessions
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Active data sessions and management
          </p>
        </div>

        {error && (
          <div style={{
            padding: "var(--spacing-lg)",
            backgroundColor: "var(--status-error-bg)",
            border: "1px solid var(--status-error)",
            borderRadius: "var(--radius-md)",
            color: "var(--status-error)",
            fontSize: "13px"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Total Sessions
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {loading ? "-" : sessions.length}
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
              {loading ? "-" : activeSessions}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Active Now
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Unique UEs
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {loading ? "-" : new Set(sessions.map(s => s.supi)).size}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Connected
            </div>
          </Card>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600 }}>
              Active Sessions
            </h2>
            <button
              onClick={fetchSessions}
              disabled={loading}
              style={{
                padding: "var(--spacing-sm) var(--spacing-md)",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <Card>
              <div style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--text-muted)" }}>
                Loading sessions...
              </div>
            </Card>
          ) : sessions.length === 0 ? (
            <Card>
              <div style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--text-muted)" }}>
                No active sessions
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "140px 60px 100px 120px 80px 100px 80px",
                padding: "var(--spacing-md) var(--spacing-lg)",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 500,
              }}>
                <div>SUPI</div>
                <div>PDU ID</div>
                <div>DNN</div>
                <div>IP Address</div>
                <div>S-NSSAI</div>
                <div>Duration</div>
                <div>Actions</div>
              </div>
              {sessions.map((session, index) => (
                <div
                  key={session._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 60px 100px 120px 80px 100px 80px",
                    padding: "var(--spacing-lg)",
                    borderBottom: index < sessions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    alignItems: "center",
                    transition: "background-color 150ms",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {session.supi.replace('imsi-', '')}
                  </div>
                  <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {session.pdu_session_id}
                  </div>
                  <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {session.dnn}
                  </div>
                  <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {formatIpAddress(session)}
                  </div>
                  <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {formatSnssai(session)}
                  </div>
                  <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {formatDuration(session.created_at)}
                  </div>
                  <div>
                    <button
                      onClick={() => handleTerminateSession(session._id)}
                      disabled={terminating === session._id}
                      style={{
                        padding: "var(--spacing-xs) var(--spacing-sm)",
                        backgroundColor: terminating === session._id ? "var(--bg-secondary)" : "var(--status-error-bg)",
                        border: "1px solid var(--status-error)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--status-error)",
                        fontSize: "11px",
                        fontWeight: 500,
                        cursor: terminating === session._id ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        opacity: terminating === session._id ? 0.6 : 1,
                      }}
                      title="Terminate session"
                    >
                      <X size={12} weight="bold" />
                      {terminating === session._id ? "..." : "End"}
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
