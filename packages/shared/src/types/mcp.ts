/**
 * MCP (Model Context Protocol) server types
 */

export type MCPTransportType = 'stdio' | 'http' | 'sse' | 'sdk';

export type MCPServerCategory =
  | 'filesystem'
  | 'git'
  | 'database'
  | 'api'
  | 'cloud'
  | 'productivity'
  | 'custom';

export interface MCPServerBase {
  id: string;
  name: string;
  description?: string;
  transportType: MCPTransportType;
  enabled: boolean;
}

export interface MCPStdioServer extends MCPServerBase {
  transportType: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPHttpServer extends MCPServerBase {
  transportType: 'http';
  url: string;
  headers?: Record<string, string>;
}

export interface MCPSseServer extends MCPServerBase {
  transportType: 'sse';
  url: string;
  headers?: Record<string, string>;
}

export interface MCPSdkServer extends MCPServerBase {
  transportType: 'sdk';
  serverModule: string;
}

export type MCPServer = MCPStdioServer | MCPHttpServer | MCPSseServer | MCPSdkServer;

export interface MCPServerTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: MCPServerCategory;
  defaultConfig: Partial<MCPServer>;
}
