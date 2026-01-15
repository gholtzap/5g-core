export type MessageDirection = 'request' | 'response' | 'indication' | 'notification';

export type MessageType =
  | 'NGAP'
  | 'NAS'
  | 'HTTP'
  | 'PFCP'
  | 'GTP';

export type NetworkEntity =
  | 'UE'
  | 'gNB'
  | 'AMF'
  | 'AUSF'
  | 'UDM'
  | 'NRF'
  | 'SMF'
  | 'UPF'
  | 'NSSF'
  | 'PCF';

export interface MessageFlowEntry {
  id: string;
  timestamp: string;
  timestampMs: number;
  source: NetworkEntity;
  destination: NetworkEntity;
  messageType: MessageType;
  messageName: string;
  direction: MessageDirection;
  details?: Record<string, any>;
  rawLog?: string;
}

export interface MessageFlowFilter {
  entities?: NetworkEntity[];
  messageTypes?: MessageType[];
  startTime?: string;
  endTime?: string;
  searchQuery?: string;
}
