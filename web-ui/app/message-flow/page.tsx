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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
              Message Flow Tracer
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Visual sequence diagram of NAS/NGAP protocol messages
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={() => setPaused(!paused)}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
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
              disabled={loading}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                transition: 'background-color 150ms',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            >
              <ArrowsClockwise size={18} weight="bold" />
              Refresh
            </button>
          </div>
        </div>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <MagnifyingGlass
                  size={16}
                  weight="regular"
                  style={{
                    position: 'absolute',
                    left: 'var(--spacing-md)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 40px',
                    fontSize: '13px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              >
                <Funnel size={18} weight="bold" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-lg)',
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-sm)',
                  }}>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Network Entities
                    </label>
                    {selectedEntities.length > 0 && (
                      <button
                        onClick={clearFilters}
                        style={{
                          fontSize: '11px',
                          color: 'var(--accent-blue)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                    {ALL_ENTITIES.map((entity) => (
                      <button
                        key={entity}
                        onClick={() => toggleEntity(entity)}
                        style={{
                          padding: '6px var(--spacing-md)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          border: '1px solid var(--border)',
                          backgroundColor: selectedEntities.includes(entity)
                            ? 'var(--accent-blue)'
                            : 'var(--bg-secondary)',
                          color: selectedEntities.includes(entity)
                            ? 'white'
                            : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 150ms',
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedEntities.includes(entity)) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedEntities.includes(entity)) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          }
                        }}
                      >
                        {entity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: 'var(--spacing-sm)',
                  }}>
                    Message Types
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                    {ALL_MESSAGE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleMessageType(type)}
                        style={{
                          padding: '6px var(--spacing-md)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          border: '1px solid var(--border)',
                          backgroundColor: selectedMessageTypes.includes(type)
                            ? 'var(--accent-blue)'
                            : 'var(--bg-secondary)',
                          color: selectedMessageTypes.includes(type)
                            ? 'white'
                            : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 150ms',
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedMessageTypes.includes(type)) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedMessageTypes.includes(type)) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          }
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              <div>
                Showing {filteredMessages.length} of {messages.length} messages
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                color: paused ? 'var(--status-warning)' : 'var(--status-success)',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: paused ? 'var(--status-warning)' : 'var(--status-success)',
                  animation: paused ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }} />
                {paused ? 'Paused' : 'Live'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '256px',
            }}>
              <div style={{ color: 'var(--text-secondary)' }}>Loading messages...</div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '256px',
            }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                No messages found
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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
