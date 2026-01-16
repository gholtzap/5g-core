'use client';

import { MessageFlowEntry } from '@/types/message-flow';
import { ArrowRight } from '@phosphor-icons/react';

interface SequenceDiagramProps {
  messages: MessageFlowEntry[];
  selectedEntities?: string[];
}

const MESSAGE_TYPE_COLORS: Record<string, string> = {
  NGAP: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  NAS: 'bg-green-500/10 text-green-400 border-green-500/30',
  HTTP: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PFCP: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  GTP: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
};

export default function SequenceDiagram({ messages }: SequenceDiagramProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 });
  };

  return (
    <div className="space-y-2">
      {messages.map((message) => {
        const typeColor = MESSAGE_TYPE_COLORS[message.messageType] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';

        return (
          <div
            key={message.id}
            className="flex items-center gap-3 p-3 bg-secondary hover:bg-tertiary transition-colors rounded-md border border-border"
          >
            <div className="text-xs text-text-muted font-mono w-24 flex-shrink-0">
              {formatTime(message.timestamp)}
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="px-3 py-1 bg-tertiary text-text-primary rounded text-sm font-medium min-w-[60px] text-center">
                {message.source}
              </span>

              <ArrowRight size={16} weight="bold" className="text-text-muted flex-shrink-0" />

              <span className="px-3 py-1 bg-tertiary text-text-primary rounded text-sm font-medium min-w-[60px] text-center">
                {message.destination}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-text-primary font-medium flex-1">
                {message.messageName}
              </span>

              <span className={`px-2 py-1 rounded text-xs font-medium border ${typeColor}`}>
                {message.messageType}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
