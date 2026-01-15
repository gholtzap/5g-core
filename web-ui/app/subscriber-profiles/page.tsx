"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import SubscriberForm from "@/components/SubscriberForm";
import { SubscriberProfile, CreateSubscriberRequest, UpdateSubscriberRequest } from "@/types/subscriber";
import { Plus, PencilSimple, Trash, UserCircle } from "@phosphor-icons/react";

export default function SubscriberProfilesPage() {
  const [subscribers, setSubscribers] = useState<SubscriberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<SubscriberProfile | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/subscribers");
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (data: CreateSubscriberRequest) => {
    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to add subscriber";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    await fetchSubscribers();
    setIsAddModalOpen(false);
  };

  const handleEditSubscriber = async (data: UpdateSubscriberRequest) => {
    if (!selectedSubscriber?._id) return;

    const response = await fetch(`/api/subscribers/${selectedSubscriber._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update subscriber";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    await fetchSubscribers();
    setIsEditModalOpen(false);
    setSelectedSubscriber(null);
  };

  const handleDeleteSubscriber = async () => {
    if (!selectedSubscriber?._id) return;

    const response = await fetch(`/api/subscribers/${selectedSubscriber._id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete subscriber";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    await fetchSubscribers();
    setIsDeleteModalOpen(false);
    setSelectedSubscriber(null);
  };

  const openEditModal = (subscriber: SubscriberProfile) => {
    setSelectedSubscriber(subscriber);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (subscriber: SubscriberProfile) => {
    setSelectedSubscriber(subscriber);
    setIsDeleteModalOpen(true);
  };

  return (
    <DashboardLayout activePage="subscriber-profiles">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
              Subscriber Profiles
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Manage subscriber authentication credentials and PLMN settings
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)",
              padding: "var(--spacing-sm) var(--spacing-lg)",
              backgroundColor: "var(--accent-blue)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "white",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 500,
              transition: "background-color 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-blue-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-blue)")}
          >
            <Plus size={16} weight="bold" />
            Add Subscriber
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
          <Card>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--spacing-sm)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Total Profiles
            </div>
            <div style={{ fontSize: "32px", fontWeight: 600, color: "var(--text-primary)" }} className="mono">
              {subscribers.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
              Provisioned Subscribers
            </div>
          </Card>
        </div>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "var(--spacing-lg)" }}>
            Provisioned Subscribers
          </h2>
          {loading ? (
            <Card>
              <div style={{ textAlign: "center", padding: "var(--spacing-2xl)", color: "var(--text-muted)" }}>
                Loading...
              </div>
            </Card>
          ) : subscribers.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "var(--spacing-2xl)", color: "var(--text-muted)" }}>
                No subscribers provisioned. Click "Add Subscriber" to get started.
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "48px 1.5fr 1fr 1fr 120px 100px",
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
                <div>K</div>
                <div>OPc</div>
                <div>PLMN</div>
                <div>Actions</div>
              </div>
              {subscribers.map((subscriber, index) => (
                <div
                  key={subscriber._id?.toString()}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1.5fr 1fr 1fr 120px 100px",
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
                    <UserCircle size={16} weight="duotone" color="var(--accent-blue)" />
                  </div>
                  <div className="mono" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                    {subscriber.supi}
                  </div>
                  <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {subscriber.permanentKey.substring(0, 8)}...
                  </div>
                  <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {subscriber.operatorKey.substring(0, 8)}...
                  </div>
                  <div className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {subscriber.plmn ? `${subscriber.plmn.mcc}${subscriber.plmn.mnc}` : "-"}
                  </div>
                  <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                    <button
                      onClick={() => openEditModal(subscriber)}
                      style={{
                        padding: "var(--spacing-xs)",
                        backgroundColor: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-secondary)",
                        transition: "all 150ms",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--accent-blue-subtle)";
                        e.currentTarget.style.borderColor = "var(--accent-blue)";
                        e.currentTarget.style.color = "var(--accent-blue)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <PencilSimple size={16} weight="bold" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(subscriber)}
                      style={{
                        padding: "var(--spacing-xs)",
                        backgroundColor: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-secondary)",
                        transition: "all 150ms",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--status-error-subtle)";
                        e.currentTarget.style.borderColor = "var(--status-error)";
                        e.currentTarget.style.color = "var(--status-error)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Subscriber">
        <SubscriberForm onSubmit={handleAddSubscriber} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Subscriber">
        {selectedSubscriber && (
          <SubscriberForm
            subscriber={selectedSubscriber}
            onSubmit={handleEditSubscriber}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Subscriber">
        <div>
          <p style={{ marginBottom: "var(--spacing-lg)", color: "var(--text-secondary)" }}>
            Are you sure you want to delete this subscriber profile?
          </p>
          <div className="mono" style={{ padding: "var(--spacing-md)", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", marginBottom: "var(--spacing-lg)", fontSize: "12px" }}>
            {selectedSubscriber?.supi}
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end" }}>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              style={{
                padding: "var(--spacing-sm) var(--spacing-lg)",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
                transition: "background-color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubscriber}
              style={{
                padding: "var(--spacing-sm) var(--spacing-lg)",
                backgroundColor: "var(--status-error)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "white",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
                transition: "opacity 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Delete Subscriber
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
