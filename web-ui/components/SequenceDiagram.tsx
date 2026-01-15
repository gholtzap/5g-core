'use client';

import { MessageFlowEntry, NetworkEntity } from '@/types/message-flow';

interface SequenceDiagramProps {
  messages: MessageFlowEntry[];
  selectedEntities?: NetworkEntity[];
}

const ENTITY_ORDER: NetworkEntity[] = ['UE', 'gNB', 'AMF', 'AUSF', 'UDM', 'NRF', 'SMF', 'UPF', 'NSSF', 'PCF'];

const MESSAGE_TYPE_COLORS: Record<string, string> = {
  NGAP: '#3b82f6',
  NAS: '#10b981',
  HTTP: '#f59e0b',
  PFCP: '#8b5cf6',
  GTP: '#ec4899',
};

const LANE_WIDTH = 120;
const LANE_SPACING = 20;
const MESSAGE_HEIGHT = 60;
const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 40;
const ARROW_HEIGHT = 8;

export default function SequenceDiagram({ messages, selectedEntities }: SequenceDiagramProps) {
  const activeEntities = selectedEntities && selectedEntities.length > 0
    ? ENTITY_ORDER.filter(entity => selectedEntities.includes(entity))
    : ENTITY_ORDER.filter(entity =>
        messages.some(m => m.source === entity || m.destination === entity)
      );

  const entityPositions = new Map<NetworkEntity, number>();
  activeEntities.forEach((entity, index) => {
    entityPositions.set(entity, index * (LANE_WIDTH + LANE_SPACING) + LANE_WIDTH / 2);
  });

  const totalWidth = activeEntities.length * (LANE_WIDTH + LANE_SPACING) + LANE_SPACING;
  const totalHeight = HEADER_HEIGHT + messages.length * MESSAGE_HEIGHT + FOOTER_HEIGHT;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 });
  };

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalWidth}
        height={totalHeight}
        className="bg-primary"
        style={{ minWidth: '800px' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
          </marker>
        </defs>

        {activeEntities.map((entity, index) => {
          const x = index * (LANE_WIDTH + LANE_SPACING) + LANE_WIDTH / 2;
          return (
            <g key={entity}>
              <rect
                x={x - 40}
                y={20}
                width={80}
                height={40}
                fill="var(--color-secondary)"
                stroke="var(--color-border)"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={x}
                y={45}
                textAnchor="middle"
                fill="var(--color-text-primary)"
                fontSize="14"
                fontWeight="600"
              >
                {entity}
              </text>

              <line
                x1={x}
                y1={HEADER_HEIGHT}
                x2={x}
                y2={totalHeight - FOOTER_HEIGHT}
                stroke="var(--color-border)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </g>
          );
        })}

        {messages.map((message, index) => {
          const sourceX = entityPositions.get(message.source);
          const destX = entityPositions.get(message.destination);

          if (sourceX === undefined || destX === undefined) return null;

          const y = HEADER_HEIGHT + index * MESSAGE_HEIGHT + MESSAGE_HEIGHT / 2;
          const isForward = sourceX < destX;
          const startX = isForward ? sourceX : destX;
          const endX = isForward ? destX : sourceX;
          const direction = isForward ? 1 : -1;

          const color = MESSAGE_TYPE_COLORS[message.messageType] || '#6b7280';

          return (
            <g key={message.id}>
              <line
                x1={sourceX}
                y1={y}
                x2={destX}
                y2={y}
                stroke={color}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                style={{ color }}
              />

              <rect
                x={startX + (endX - startX) / 2 - 80}
                y={y - 20}
                width={160}
                height={24}
                fill="var(--color-secondary)"
                stroke={color}
                strokeWidth="1"
                rx="4"
              />

              <text
                x={startX + (endX - startX) / 2}
                y={y - 4}
                textAnchor="middle"
                fill="var(--color-text-primary)"
                fontSize="11"
                fontWeight="500"
              >
                {message.messageName}
              </text>

              <text
                x={10}
                y={y + 4}
                fill="var(--color-text-muted)"
                fontSize="10"
              >
                {formatTime(message.timestamp)}
              </text>

              <rect
                x={startX + (endX - startX) / 2 - 80}
                y={y + 6}
                width={160}
                height={16}
                fill="var(--color-tertiary)"
                rx="3"
              />
              <text
                x={startX + (endX - startX) / 2}
                y={y + 16}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                fontSize="9"
              >
                {message.messageType}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
