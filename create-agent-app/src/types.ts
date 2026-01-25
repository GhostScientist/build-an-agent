// Types matching the web app's agent.ts for generator compatibility

export type AgentDomain = 'development' | 'business' | 'creative' | 'data' | 'knowledge';

export type SDKProvider = 'claude' | 'openai' | 'huggingface' | 'copilot';

export type PermissionLevel = 'restrictive' | 'balanced' | 'permissive';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'command' | 'web' | 'database' | 'integration' | 'custom';
  enabled: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  config?: Record<string, unknown>;
}

// MCP Server Types
export type MCPTransportType = 'stdio' | 'http' | 'sse' | 'sdk';

export type MCPServerCategory = 'filesystem' | 'git' | 'database' | 'api' | 'cloud' | 'productivity' | 'custom';

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
  category: MCPServerCategory;
  requiresInput?: boolean;
  inputId?: string;
  inputDescription?: string;
  requiresConfiguration?: boolean;
  configurationNote?: string;
  defaultConfig: {
    transportType: MCPTransportType;
    command?: string;
    args?: string[];
    url?: string;
    env?: Record<string, string>;
  };
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  domain: AgentDomain;
  icon: string;
  gradient: string;
  defaultTools: string[];
  samplePrompts: string[];
  codeTemplates: Record<string, string>;
  documentation: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  domain: AgentDomain;
  templateId?: string;
  sdkProvider: SDKProvider;
  model?: string;
  tools: AgentTool[];
  mcpServers: MCPServer[];
  customInstructions: string;
  permissions: PermissionLevel;
  maxTokens?: number;
  temperature?: number;
  projectName: string;
  packageName: string;
  version: string;
  author: string;
  license: string;
  repository?: string;
}

export interface GeneratedProject {
  config: AgentConfig;
  files: GeneratedFile[];
  metadata: ProjectMetadata;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'typescript' | 'json' | 'markdown' | 'dockerfile' | 'yaml' | 'shell';
  template: string;
}

export interface ProjectMetadata {
  generatedAt: Date;
  templateVersion: string;
  agentWorkshopVersion: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  buildInstructions: string[];
  deploymentOptions: string[];
}

export interface CLIOptions {
  projectName?: string;
}

export interface DomainChoice {
  value: AgentDomain;
  name: string;
  hint: string;
}

export interface ModelChoice {
  value: string;
  name: string;
  hint?: string;
}
