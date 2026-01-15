interface StatusBadgeProps {
  status: "online" | "offline" | "checking";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    online: {
      bg: "var(--status-success-subtle)",
      text: "var(--status-success)",
      label: "Online",
    },
    offline: {
      bg: "var(--status-error-subtle)",
      text: "var(--status-error)",
      label: "Offline",
    },
    checking: {
      bg: "var(--status-neutral-subtle)",
      text: "var(--status-neutral)",
      label: "Checking",
    },
  };

  const style = styles[status];

  return (
    <span
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: "var(--radius-sm)",
        backgroundColor: style.bg,
        color: style.text,
        fontSize: "11px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {style.label}
    </span>
  );
}
