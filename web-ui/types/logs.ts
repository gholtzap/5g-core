export interface LogEntry {
  timestamp: string;
  message: string;
  level?: string;
  container: string;
}

export type LogLevel = "all" | "error" | "warn" | "info" | "debug";

export interface NetworkFunction {
  id: string;
  name: string;
  container: string;
}
