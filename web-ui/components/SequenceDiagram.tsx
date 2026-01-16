'use client';

import { MessageFlowEntry } from '@/types/message-flow';
import { ArrowRight, Clock } from '@phosphor-icons/react';

interface SequenceDiagramProps {
  messages: MessageFlowEntry[];
  selectedEntities?: string[];
}

const MESSAGE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  NGAP: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  NAS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  HTTP: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  PFCP: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  GTP: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
};

export default function SequenceDiagram({ messages }: SequenceDiagramProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 });
  };

  return (
    <div className="space-y-1.5">
      {messages.map((message, index) => {
        const typeStyle = MESSAGE_TYPE_STYLES[message.messageType] || {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/20'
        };

        return (
          <div
            key={message.id}
            className="group relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-accent-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-4 p-3.5 bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border rounded-lg transition-all duration-200 hover:shadow-sm ml-2">
              <div className="flex items-center gap-2 text-text-muted min-w-[100px]">
                <Clock size={14} weight="bold" className="opacity-50" />
                <span className="text-xs font-mono">
                  {formatTime(message.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-3 min-w-[240px]">
                <div className="px-3 py-1.5 bg-tertiary/80 text-text-primary rounded-md text-sm font-medium min-w-[70px] text-center shadow-sm">
                  {message.source}
                </div>

                <ArrowRight size={18} weight="bold" className="text-accent-blue/60 flex-shrink-0" />

                <div className="px-3 py-1.5 bg-tertiary/80 text-text-primary rounded-md text-sm font-medium min-w-[70px] text-center shadow-sm">
                  {message.destination}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-primary font-medium truncate">
                  {message.messageName}
                </div>
              </div>

              <div className={`px-3 py-1 rounded-md text-xs font-semibold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} tracking-wide`}>
                {message.messageType}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
