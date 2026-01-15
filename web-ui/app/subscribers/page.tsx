"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { MagnifyingGlass, User } from "@phosphor-icons/react";
import { SubscriberProfile } from "@/types/subscriber";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberProfile[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<SubscriberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [authFilter, setAuthFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    filterSubscribers();
  }, [subscribers, searchQuery, authFilter]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscribers');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscribers = () => {
    let filtered = subscribers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.supi.toLowerCase().includes(query) ||
        sub.permanentKey?.toLowerCase().includes(query) ||
        sub.operatorKey?.toLowerCase().includes(query)
      );
    }

    if (authFilter !== 'all') {
      filtered = filtered.filter(sub => sub.authenticationMethod === authFilter);
    }

    setFilteredSubscribers(filtered);
  };

  return (
    <DashboardLayout activePage="subscribers">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
            Subscribers
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Registered subscriber profiles and authentication data
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
              Registered Profiles
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Filtered Results
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--status-success)" }} className="mono">
              {filteredSubscribers.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Matching Criteria
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Authentication
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              5G
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              AKA Method
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-lg)", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <MagnifyingGlass
              size={16}
              weight="regular"
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
              placeholder="Search by SUPI, permanent key, or operator key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 40px",
                fontSize: "13px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          <select
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value)}
            style={{
              padding: "var(--spacing-sm) var(--spacing-md)",
              fontSize: "13px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Methods</option>
            <option value="5G_AKA">5G AKA</option>
            <option value="EAP_AKA_PRIME">EAP-AKA'</option>
          </select>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Subscriber Profiles
          </h2>
          {loading ? (
            <Card>
              <div style={{ padding: "var(--spacing-2xl)", textAlign: "center", color: "var(--text-muted)" }}>
                Loading subscribers...
              </div>
            </Card>
          ) : filteredSubscribers.length === 0 ? (
            <Card>
              <div style={{ padding: "var(--spacing-2xl)", textAlign: "center", color: "var(--text-muted)" }}>
                {searchQuery || authFilter !== 'all' ? 'No subscribers match your search criteria' : 'No subscribers found'}
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 1fr 1fr 140px",
                padding: "var(--spacing-md) var(--spacing-lg)",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 500,
              }}>
                <div></div>
                <div>SUPI</div>
                <div>Auth Method</div>
                <div>PLMN</div>
                <div>Created At</div>
              </div>
              {filteredSubscribers.map((subscriber, index) => (
                <div
                  key={subscriber._id?.toString() || subscriber.supi}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 1fr 1fr 140px",
                    padding: "var(--spacing-lg)",
                    borderBottom: index < filteredSubscribers.length - 1 ? "1px solid var(--border-subtle)" : "none",
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
                    <User size={16} weight="duotone" color="var(--text-muted)" />
                  </div>
                  <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                    {subscriber.supi}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {subscriber.authenticationMethod || '5G_AKA'}
                  </div>
                  <div className="mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {subscriber.plmn ? `${subscriber.plmn.mcc}-${subscriber.plmn.mnc}` : 'N/A'}
                  </div>
                  <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleString() : 'N/A'}
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
