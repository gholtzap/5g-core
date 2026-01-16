export interface Snssai {
  sst: number;
  sd?: string;
}

export interface PduAddress {
  ipv4?: string;
  ipv6?: string;
}

export interface TunnelInfo {
  ipv4Addr?: string;
  ipv6Addr?: string;
  gtpTeid: string;
}

export interface Session {
  _id: string;
  supi: string;
  pdu_session_id: number;
  dnn: string;
  s_nssai: Snssai;
  pdu_session_type: string;
  ssc_mode: string;
  state: string;
  pdu_address?: PduAddress;
  pfcp_session_id?: number;
  created_at: string;
  updated_at: string;
  upf_address?: string;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
}

export interface SessionTerminateRequest {
  sessionId: string;
  smContextRef: string;
}

export interface SessionTerminateResponse {
  success: boolean;
  message?: string;
}
