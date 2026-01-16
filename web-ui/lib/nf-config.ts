import { NetworkFunctionConfig } from '@/types/network-function';

export const NF_CONFIGS: NetworkFunctionConfig[] = [
  {
    id: 'nrf',
    name: 'NRF',
    fullName: 'Network Repository Function',
    container: 'nrf',
    url: 'http://nrf:8080',
    port: 8082,
    description: 'Network Repository Function',
    category: 'control-plane',
    iconName: 'Database'
  },
  {
    id: 'ausf',
    name: 'AUSF',
    fullName: 'Authentication Server Function',
    container: 'ausf',
    url: 'http://ausf:8080',
    port: 8081,
    description: 'Authentication Server Function',
    category: 'control-plane',
    iconName: 'ShieldCheck'
  },
  {
    id: 'udm',
    name: 'UDM',
    fullName: 'Unified Data Management',
    container: 'udm',
    url: 'http://udm:8080',
    port: 8084,
    description: 'Unified Data Management',
    category: 'control-plane',
    iconName: 'Database'
  },
  {
    id: 'nssf',
    name: 'NSSF',
    fullName: 'Network Slice Selection Function',
    container: 'nssf',
    url: 'http://nssf:8080',
    port: 8083,
    description: 'Network Slice Selection Function',
    category: 'control-plane',
    iconName: 'Network'
  },
  {
    id: 'amf',
    name: 'AMF',
    fullName: 'Access and Mobility Function',
    container: 'amf',
    url: 'http://amf:8000',
    port: 8086,
    description: 'Access and Mobility Function',
    category: 'control-plane',
    iconName: 'Broadcast'
  },
  {
    id: 'smf',
    name: 'SMF',
    fullName: 'Session Management Function',
    container: 'smf',
    url: 'http://smf:8080',
    port: 8085,
    description: 'Session Management Function',
    category: 'control-plane',
    iconName: 'Heartbeat'
  },
  {
    id: 'upf',
    name: 'UPF',
    fullName: 'User Plane Function',
    container: 'upf',
    url: 'http://upf:8080',
    port: 8087,
    description: 'User Plane Function',
    category: 'user-plane',
    iconName: 'CloudArrowUp'
  }
];

export function getNFById(id: string): NetworkFunctionConfig | undefined {
  return NF_CONFIGS.find(nf => nf.id === id);
}

export function getNFByName(name: string): NetworkFunctionConfig | undefined {
  return NF_CONFIGS.find(nf => nf.name.toLowerCase() === name.toLowerCase());
}
