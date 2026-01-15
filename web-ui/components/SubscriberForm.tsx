"use client";

import { useState, useEffect } from "react";
import { SubscriberProfile, CreateSubscriberRequest, UpdateSubscriberRequest } from "@/types/subscriber";
import { DiceFive } from "@phosphor-icons/react";

interface SubscriberFormProps {
  subscriber?: SubscriberProfile;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function SubscriberForm({ subscriber, onSubmit, onCancel }: SubscriberFormProps) {
  const [formData, setFormData] = useState({
    supi: subscriber?.supi || "",
    permanentKey: subscriber?.permanentKey || "",
    operatorKey: subscriber?.operatorKey || "",
    sequenceNumber: subscriber?.sequenceNumber || "",
    mcc: subscriber?.plmn?.mcc || "999",
    mnc: subscriber?.plmn?.mnc || "70",
    authenticationMethod: subscriber?.authenticationMethod || "5G_AKA",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateRandomHex = (length: number): string => {
    const chars = "0123456789ABCDEF";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRandomIMSI = (): string => {
    const msin = Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");
    return `imsi-999700${msin}`;
  };

  const handleGenerateRandom = () => {
    setFormData({
      ...formData,
      supi: generateRandomIMSI(),
      permanentKey: generateRandomHex(32),
      operatorKey: generateRandomHex(32),
      sequenceNumber: generateRandomHex(12),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data: CreateSubscriberRequest | UpdateSubscriberRequest = {
        ...(!subscriber && { supi: formData.supi }),
        permanentKey: formData.permanentKey,
        operatorKey: formData.operatorKey,
        sequenceNumber: formData.sequenceNumber,
        plmn: {
          mcc: formData.mcc,
          mnc: formData.mnc,
        },
        authenticationMethod: formData.authenticationMethod,
      };

      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || "Failed to save subscriber");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "var(--spacing-sm)",
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: "13px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "var(--spacing-xs)",
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: 500,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
        {!subscriber && (
          <>
            <button
              type="button"
              onClick={handleGenerateRandom}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-sm) var(--spacing-md)",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 500,
                transition: "all 150ms",
                alignSelf: "flex-start",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "var(--accent-purple-subtle)";
                  e.currentTarget.style.borderColor = "var(--accent-purple)";
                  e.currentTarget.style.color = "var(--accent-purple)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
            >
              <DiceFive size={14} weight="bold" />
              Generate Random
            </button>
            <div>
              <label style={labelStyle}>IMSI (SUPI)</label>
              <input
                type="text"
                value={formData.supi}
                onChange={(e) => setFormData({ ...formData, supi: e.target.value })}
                placeholder="imsi-999700000000001"
                required
                disabled={loading}
                style={inputStyle}
                className="mono"
              />
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
                Format: imsi-MCCMNC followed by MSIN
              </div>
            </div>
          </>
        )}

        <div>
          <label style={labelStyle}>Permanent Key (K)</label>
          <input
            type="text"
            value={formData.permanentKey}
            onChange={(e) => setFormData({ ...formData, permanentKey: e.target.value })}
            placeholder="465B5CE8B199B49FAA5F0A2EE238A6BC"
            required
            disabled={loading}
            style={inputStyle}
            className="mono"
            maxLength={32}
          />
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
            32 hex characters
          </div>
        </div>

        <div>
          <label style={labelStyle}>Operator Key (OPc)</label>
          <input
            type="text"
            value={formData.operatorKey}
            onChange={(e) => setFormData({ ...formData, operatorKey: e.target.value })}
            placeholder="E8ED289DEBA952E4283B54E88E6183CA"
            required
            disabled={loading}
            style={inputStyle}
            className="mono"
            maxLength={32}
          />
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
            32 hex characters
          </div>
        </div>

        <div>
          <label style={labelStyle}>Sequence Number (SQN)</label>
          <input
            type="text"
            value={formData.sequenceNumber}
            onChange={(e) => setFormData({ ...formData, sequenceNumber: e.target.value })}
            placeholder="000000000000"
            required
            disabled={loading}
            style={inputStyle}
            className="mono"
            maxLength={12}
          />
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "var(--spacing-xs)" }}>
            12 hex characters
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)" }}>
          <div>
            <label style={labelStyle}>MCC</label>
            <input
              type="text"
              value={formData.mcc}
              onChange={(e) => setFormData({ ...formData, mcc: e.target.value })}
              placeholder="999"
              required
              disabled={loading}
              style={inputStyle}
              className="mono"
              maxLength={3}
            />
          </div>
          <div>
            <label style={labelStyle}>MNC</label>
            <input
              type="text"
              value={formData.mnc}
              onChange={(e) => setFormData({ ...formData, mnc: e.target.value })}
              placeholder="70"
              required
              disabled={loading}
              style={inputStyle}
              className="mono"
              maxLength={3}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Authentication Method</label>
          <select
            value={formData.authenticationMethod}
            onChange={(e) => setFormData({ ...formData, authenticationMethod: e.target.value })}
            disabled={loading}
            style={{
              ...inputStyle,
              cursor: "pointer",
            }}
          >
            <option value="5G_AKA">5G AKA</option>
            <option value="EAP_AKA_PRIME">EAP-AKA'</option>
          </select>
        </div>

        {error && (
          <div
            style={{
              padding: "var(--spacing-sm)",
              backgroundColor: "var(--status-error-subtle)",
              border: "1px solid var(--status-error)",
              borderRadius: "var(--radius-sm)",
              color: "var(--status-error)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "var(--spacing-sm) var(--spacing-lg)",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-primary)",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
              transition: "background-color 150ms",
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "var(--bg-elevated)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "var(--spacing-sm) var(--spacing-lg)",
              backgroundColor: "var(--accent-blue)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "white",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
              transition: "background-color 150ms",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "var(--accent-blue-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-blue)")}
          >
            {loading ? "Saving..." : subscriber ? "Update Subscriber" : "Add Subscriber"}
          </button>
        </div>
      </div>
    </form>
  );
}
