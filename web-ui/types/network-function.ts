export interface NetworkFunctionConfig {
  id: string;
  name: string;
  fullName: string;
  container: string;
  url: string;
  port: number;
  description: string;
  category: 'control-plane' | 'user-plane';
  iconName: string;
}

export interface NFStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  port: number;
  description: string;
  category: string;
  requests: number;
  avgLatency: number;
  uptime: string;
}
