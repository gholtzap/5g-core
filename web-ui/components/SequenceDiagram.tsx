'use client';

import { MessageFlowEntry } from '@/types/message-flow';
import { ArrowRight, Clock } from '@phosphor-icons/react';
import { useState } from 'react';

interface SequenceDiagramProps {
  messages: MessageFlowEntry[];
  selectedEntities?: string[];
}

const MESSAGE_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  NGAP: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' },
  NAS: { bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399', border: 'rgba(16, 185, 129, 0.2)' },
  HTTP: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)' },
  PFCP: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a78bfa', border: 'rgba(168, 85, 247, 0.2)' },
  GTP: { bg: 'rgba(236, 72, 153, 0.1)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.2)' },
};

export default function SequenceDiagram({ messages }: SequenceDiagramProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
      {messages.map((message, index) => {
        const typeColors = MESSAGE_TYPE_COLORS[message.messageType] || {
          bg: 'var(--status-neutral-subtle)',
          text: 'var(--text-secondary)',
          border: 'var(--border)'
        };
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={message.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              backgroundColor: isHovered ? 'var(--bg-tertiary)' : 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              transition: 'background-color 150ms, border-color 150ms',
              borderColor: isHovered ? 'var(--border)' : 'var(--border-subtle)',
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              minWidth: '100px',
              color: 'var(--text-muted)',
            }}>
              <Clock size={14} weight="bold" style={{ opacity: 0.5 }} />
              <span className="mono" style={{ fontSize: '11px' }}>
                {formatTime(message.timestamp)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              minWidth: '240px',
            }}>
              <div style={{
                padding: '6px var(--spacing-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500,
                minWidth: '70px',
                textAlign: 'center',
                color: 'var(--text-primary)',
              }}>
                {message.source}
              </div>

              <ArrowRight size={18} weight="bold" style={{ color: 'var(--accent-blue)', opacity: 0.6, flexShrink: 0 }} />

              <div style={{
                padding: '6px var(--spacing-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500,
                minWidth: '70px',
                textAlign: 'center',
                color: 'var(--text-primary)',
              }}>
                {message.destination}
              </div>
            </div>

            <div style={{
              flex: 1,
              minWidth: 0,
            }}>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {message.messageName}
              </div>
            </div>

            <div style={{
              padding: '4px var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              fontWeight: 600,
              border: `1px solid ${typeColors.border}`,
              backgroundColor: typeColors.bg,
              color: typeColors.text,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
            }}>
              {message.messageType}
            </div>
          </div>
        );
      })}
    </div>
  );
}
