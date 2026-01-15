'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import SequenceDiagram from '@/components/SequenceDiagram';
import { MessageFlowEntry, NetworkEntity, MessageType } from '@/types/message-flow';
import { MagnifyingGlass, ArrowsClockwise, Pause, Play, Funnel } from '@phosphor-icons/react';

const ALL_ENTITIES: NetworkEntity[] = ['UE', 'gNB', 'AMF', 'AUSF', 'UDM', 'NRF', 'SMF', 'UPF', 'NSSF', 'PCF'];
const ALL_MESSAGE_TYPES: MessageType[] = ['NGAP', 'NAS', 'HTTP', 'PFCP', 'GTP'];

export default function MessageFlowPage() {
  const [messages, setMessages] = useState<MessageFlowEntry[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntities, setSelectedEntities] = useState<NetworkEntity[]>([]);
  const [selectedMessageTypes, setSelectedMessageTypes] = useState<MessageType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(() => {
      if (!paused) {
        fetchMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    let filtered = messages;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.messageName.toLowerCase().includes(query) ||
          msg.source.toLowerCase().includes(query) ||
          msg.destination.toLowerCase().includes(query)
      );
    }

    if (selectedEntities.length > 0) {
      filtered = filtered.filter(
        (msg) =>
          selectedEntities.includes(msg.source) ||
          selectedEntities.includes(msg.destination)
      );
    }

    if (selectedMessageTypes.length > 0) {
      filtered = filtered.filter((msg) =>
        selectedMessageTypes.includes(msg.messageType)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, searchQuery, selectedEntities, selectedMessageTypes]);

  const toggleEntity = (entity: NetworkEntity) => {
    setSelectedEntities((prev) =>
      prev.includes(entity)
        ? prev.filter((e) => e !== entity)
        : [...prev, entity]
    );
  };

  const toggleMessageType = (type: MessageType) => {
    setSelectedMessageTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEntities([]);
    setSelectedMessageTypes([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Message Flow Tracer
            </h1>
            <p className="text-text-secondary mt-1">
              Visual sequence diagram of NAS/NGAP protocol messages
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPaused(!paused)}
              className="px-4 py-2 bg-secondary hover:bg-tertiary text-text-primary rounded-md transition-colors flex items-center gap-2"
            >
              {paused ? (
                <>
                  <Play size={18} weight="fill" />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={18} weight="fill" />
                  Pause
                </>
              )}
            </button>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-secondary hover:bg-tertiary text-text-primary rounded-md transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <ArrowsClockwise size={18} weight="bold" />
              Refresh
            </button>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-1 relative">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-secondary hover:bg-tertiary text-text-primary rounded-md transition-colors flex items-center gap-2"
              >
                <Funnel size={18} weight="bold" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="space-y-4 p-4 bg-secondary rounded-md">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-text-primary">
                      Network Entities
                    </label>
                    {selectedEntities.length > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-accent-blue hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_ENTITIES.map((entity) => (
                      <button
                        key={entity}
                        onClick={() => toggleEntity(entity)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          selectedEntities.includes(entity)
                            ? 'bg-accent-blue text-white'
                            : 'bg-tertiary text-text-secondary hover:bg-secondary'
                        }`}
                      >
                        {entity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary block mb-2">
                    Message Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_MESSAGE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleMessageType(type)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          selectedMessageTypes.includes(type)
                            ? 'bg-accent-blue text-white'
                            : 'bg-tertiary text-text-secondary hover:bg-secondary'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-text-secondary">
              <div>
                Showing {filteredMessages.length} of {messages.length} messages
              </div>
              <div className={`flex items-center gap-2 ${paused ? 'text-warning' : 'text-success'}`}>
                <div className={`w-2 h-2 rounded-full ${paused ? 'bg-warning' : 'bg-success animate-pulse'}`} />
                {paused ? 'Paused' : 'Live'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-text-secondary">Loading messages...</div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="text-text-secondary mb-2">No messages found</div>
              <p className="text-sm text-text-muted">
                {messages.length === 0
                  ? 'Waiting for protocol messages from the 5G Core...'
                  : 'Try adjusting your filters or search query'}
              </p>
            </div>
          ) : (
            <SequenceDiagram
              messages={filteredMessages}
              selectedEntities={selectedEntities.length > 0 ? selectedEntities : undefined}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
