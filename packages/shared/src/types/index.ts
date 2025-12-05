/**
 * Type exports for @agent-workshop/shared
 */

// Agent types
export type {
  AgentDomain,
  SDKProvider,
  PermissionLevel,
  RiskLevel,
  ToolCategory,
  AgentTool,
  AgentConfig,
} from './agent.js';

// MCP types
export type {
  MCPTransportType,
  MCPServerCategory,
  MCPServerBase,
  MCPStdioServer,
  MCPHttpServer,
  MCPSseServer,
  MCPSdkServer,
  MCPServer,
  MCPServerTemplate,
} from './mcp.js';

// Project types
export type {
  GeneratedFileType,
  GeneratedFile,
  ProjectMetadata,
  GeneratedProject,
} from './project.js';

// Template types
export type { AgentTemplate } from './template.js';
