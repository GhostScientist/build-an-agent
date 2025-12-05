/**
 * Core agent types and interfaces
 */

export type AgentDomain = 'development' | 'business' | 'creative' | 'data' | 'knowledge';

export type SDKProvider = 'claude' | 'openai';

export type PermissionLevel = 'restrictive' | 'balanced' | 'permissive';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ToolCategory = 'file' | 'command' | 'web' | 'database' | 'integration' | 'custom';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  enabled: boolean;
  riskLevel?: RiskLevel;
  config?: Record<string, unknown>;
}

export interface AgentConfig {
  // Basic Info
  name: string;
  description: string;
  domain: AgentDomain;
  templateId?: string;

  // AI Provider
  sdkProvider: SDKProvider;
  model?: string;

  // Capabilities
  tools: AgentTool[];
  mcpServers: MCPServer[];
  customInstructions: string;

  // Advanced Settings
  permissions: PermissionLevel;
  maxTokens?: number;
  temperature?: number;

  // Output Configuration
  projectName: string;
  packageName: string;
  version: string;
  author: string;
  license: string;
  repository?: string;
}

// Re-export MCP types for convenience
export type { MCPServer, MCPTransportType, MCPServerCategory } from './mcp.js';
import type { MCPServer } from './mcp.js';
