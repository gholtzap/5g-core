import { MessageFlowEntry, MessageDirection, MessageType, NetworkEntity } from '@/types/message-flow';

interface ParsedMessage {
  source: NetworkEntity;
  destination: NetworkEntity;
  messageType: MessageType;
  messageName: string;
  direction: MessageDirection;
  details?: Record<string, any>;
}

const NGAP_PATTERNS = [
  {
    regex: /Processing NG Setup Request from (.+)/i,
    parse: (match: RegExpMatchArray): ParsedMessage => ({
      source: 'gNB' as NetworkEntity,
      destination: 'AMF' as NetworkEntity,
      messageType: 'NGAP' as MessageType,
      messageName: 'NG Setup Request',
      direction: 'request' as MessageDirection,
    }),
  },
  {
    regex: /RAN node (.+) successfully registered/i,
    parse: (match: RegExpMatchArray): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'gNB' as NetworkEntity,
      messageType: 'NGAP' as MessageType,
      messageName: 'NG Setup Response',
      direction: 'response' as MessageDirection,
    }),
  },
  {
    regex: /Processing Initial UE Message/i,
    parse: (): ParsedMessage => ({
      source: 'gNB' as NetworkEntity,
      destination: 'AMF' as NetworkEntity,
      messageType: 'NGAP' as MessageType,
      messageName: 'Initial UE Message',
      direction: 'indication' as MessageDirection,
    }),
  },
  {
    regex: /Processing Uplink NAS Transport/i,
    parse: (): ParsedMessage => ({
      source: 'gNB' as NetworkEntity,
      destination: 'AMF' as NetworkEntity,
      messageType: 'NGAP' as MessageType,
      messageName: 'Uplink NAS Transport',
      direction: 'indication' as MessageDirection,
    }),
  },
  {
    regex: /Sending Downlink NAS Transport/i,
    parse: (): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'gNB' as NetworkEntity,
      messageType: 'NGAP' as MessageType,
      messageName: 'Downlink NAS Transport',
      direction: 'indication' as MessageDirection,
    }),
  },
  {
    regex: /Initial Context Setup Request/i,
    parse: (): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'gNB' as NetworkEntity,
      messageType: 'NGAP' as MessageType,
      messageName: 'Initial Context Setup Request',
      direction: 'request' as MessageDirection,
    }),
  },
  {
    regex: /PDU Session Resource Setup Request/i,
    parse: (): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'gNB' as NetworkEntity,
      messageType: 'NGAP' as MessageType,
      messageName: 'PDU Session Resource Setup Request',
      direction: 'request' as MessageDirection,
    }),
  },
];

const NAS_PATTERNS = [
  {
    regex: /Decoded Registration Request.*?type=(.+?),/i,
    parse: (match: RegExpMatchArray): ParsedMessage => ({
      source: 'UE' as NetworkEntity,
      destination: 'AMF' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'Registration Request',
      direction: 'request' as MessageDirection,
      details: { type: match[1] },
    }),
  },
  {
    regex: /Sending Authentication Request|Encoded Authentication Request|Full Authentication Request NAS PDU/i,
    parse: (): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'UE' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'Authentication Request',
      direction: 'request' as MessageDirection,
    }),
  },
  {
    regex: /Decoded Authentication Response|Authentication Failure received from UE/i,
    parse: (): ParsedMessage => ({
      source: 'UE' as NetworkEntity,
      destination: 'AMF' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'Authentication Response',
      direction: 'response' as MessageDirection,
    }),
  },
  {
    regex: /Sending Security Mode Command/i,
    parse: (): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'UE' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'Security Mode Command',
      direction: 'request' as MessageDirection,
    }),
  },
  {
    regex: /Decoded Security Mode Complete/i,
    parse: (): ParsedMessage => ({
      source: 'UE' as NetworkEntity,
      destination: 'AMF' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'Security Mode Complete',
      direction: 'response' as MessageDirection,
    }),
  },
  {
    regex: /Sending Registration Accept/i,
    parse: (): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'UE' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'Registration Accept',
      direction: 'response' as MessageDirection,
    }),
  },
  {
    regex: /PDU Session Establishment Request/i,
    parse: (): ParsedMessage => ({
      source: 'UE' as NetworkEntity,
      destination: 'SMF' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'PDU Session Establishment Request',
      direction: 'request' as MessageDirection,
    }),
  },
  {
    regex: /PDU Session Establishment Accept/i,
    parse: (): ParsedMessage => ({
      source: 'SMF' as NetworkEntity,
      destination: 'UE' as NetworkEntity,
      messageType: 'NAS' as MessageType,
      messageName: 'PDU Session Establishment Accept',
      direction: 'response' as MessageDirection,
    }),
  },
];

const HTTP_PATTERNS = [
  {
    regex: /Calling UDM to get authentication info for UE: (.+)/i,
    parse: (match: RegExpMatchArray): ParsedMessage => ({
      source: 'AUSF' as NetworkEntity,
      destination: 'UDM' as NetworkEntity,
      messageType: 'HTTP' as MessageType,
      messageName: 'GET Authentication Info',
      direction: 'request' as MessageDirection,
      details: { supi: match[1] },
    }),
  },
  {
    regex: /Received authentication info from UDM/i,
    parse: (): ParsedMessage => ({
      source: 'UDM' as NetworkEntity,
      destination: 'AUSF' as NetworkEntity,
      messageType: 'HTTP' as MessageType,
      messageName: 'Authentication Info Response',
      direction: 'response' as MessageDirection,
    }),
  },
  {
    regex: /Home network authentication for UE: (.+)/i,
    parse: (match: RegExpMatchArray): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'AUSF' as NetworkEntity,
      messageType: 'HTTP' as MessageType,
      messageName: 'Authenticate Request',
      direction: 'request' as MessageDirection,
      details: { suci: match[1] },
    }),
  },
  {
    regex: /Sending to AMF - RAND:/i,
    parse: (): ParsedMessage => ({
      source: 'AUSF' as NetworkEntity,
      destination: 'AMF' as NetworkEntity,
      messageType: 'HTTP' as MessageType,
      messageName: 'Authenticate Response',
      direction: 'response' as MessageDirection,
    }),
  },
  {
    regex: /Request received.*?method:\s*'(\w+)'.*?path:\s*'([^']+)'/is,
    parse: (match: RegExpMatchArray): ParsedMessage => {
      const method = match[1];
      const path = match[2];
      let source: NetworkEntity = 'AMF';
      let destination: NetworkEntity = 'UDM';

      if (path.includes('/nudm-ueau/')) {
        destination = 'UDM';
      } else if (path.includes('/nausf-auth/')) {
        destination = 'AUSF';
      } else if (path.includes('/nnrf-nfm/')) {
        destination = 'NRF';
      } else if (path.includes('/nsmf-pdusession/')) {
        destination = 'SMF';
      }

      return {
        source,
        destination,
        messageType: 'HTTP' as MessageType,
        messageName: `${method} ${path}`,
        direction: 'request' as MessageDirection,
        details: { method, path },
      };
    },
  },
];

const PFCP_PATTERNS = [
  {
    regex: /Establishing PFCP session/i,
    parse: (): ParsedMessage => ({
      source: 'SMF' as NetworkEntity,
      destination: 'UPF' as NetworkEntity,
      messageType: 'PFCP' as MessageType,
      messageName: 'Session Establishment Request',
      direction: 'request' as MessageDirection,
    }),
  },
  {
    regex: /PFCP session established/i,
    parse: (): ParsedMessage => ({
      source: 'UPF' as NetworkEntity,
      destination: 'SMF' as NetworkEntity,
      messageType: 'PFCP' as MessageType,
      messageName: 'Session Establishment Response',
      direction: 'response' as MessageDirection,
    }),
  },
  {
    regex: /Processing PDU Session Establishment/i,
    parse: (): ParsedMessage => ({
      source: 'AMF' as NetworkEntity,
      destination: 'SMF' as NetworkEntity,
      messageType: 'HTTP' as MessageType,
      messageName: 'Create SM Context Request',
      direction: 'request' as MessageDirection,
    }),
  },
];

const ALL_PATTERNS = [...NGAP_PATTERNS, ...NAS_PATTERNS, ...HTTP_PATTERNS, ...PFCP_PATTERNS];

export function parseLogLine(
  logLine: string,
  container: string,
  timestamp: string
): MessageFlowEntry | null {
  const cleanLine = stripAnsiCodes(logLine).replace(/[\x00-\x08]/g, '').trim();

  for (const pattern of ALL_PATTERNS) {
    const match = cleanLine.match(pattern.regex);
    if (match) {
      const parsed = pattern.parse(match);

      return {
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        timestampMs: new Date(timestamp).getTime(),
        source: parsed.source,
        destination: parsed.destination,
        messageType: parsed.messageType,
        messageName: parsed.messageName,
        direction: parsed.direction,
        details: parsed.details,
        rawLog: cleanLine,
      };
    }
  }

  return null;
}

function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

export function extractTimestamp(logLine: string): string | null {
  const cleanLine = stripAnsiCodes(logLine);
  const timestampMatch = cleanLine.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?)/);
  if (timestampMatch) {
    return timestampMatch[1];
  }
  return null;
}
