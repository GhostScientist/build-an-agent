export type AgentDomain = 'development' | 'business' | 'creative' | 'data' | 'custom'

export type SDKProvider = 'claude' | 'openai' | 'anthropic-direct' | 'custom'

export type AgentInterface = 'cli' | 'web' | 'api' | 'discord' | 'slack'

export interface AgentTool {
  id: string
  name: string
  description: string
  category: 'file' | 'command' | 'web' | 'database' | 'integration' | 'custom'
  enabled: boolean
  config?: Record<string, any>
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  domain: AgentDomain
  icon: string
  gradient: string
  defaultTools: string[]
  samplePrompts: string[]
  codeTemplates: Record<string, string>
  documentation: string
}

export interface AgentConfig {
  // Basic Info
  name: string
  description: string
  domain: AgentDomain
  templateId?: string
  
  // AI Provider
  sdkProvider: SDKProvider
  model?: string
  apiKey?: string
  
  // Interface
  interface: AgentInterface
  
  // Capabilities
  tools: AgentTool[]
  customInstructions: string
  specialization: string
  
  // Advanced Settings
  permissions: 'restrictive' | 'balanced' | 'permissive'
  maxTokens?: number
  temperature?: number
  
  // Output Configuration
  projectName: string
  packageName: string
  version: string
  author: string
  license: string
}

export interface GeneratedProject {
  config: AgentConfig
  files: GeneratedFile[]
  metadata: ProjectMetadata
}

export interface GeneratedFile {
  path: string
  content: string
  type: 'typescript' | 'json' | 'markdown' | 'dockerfile' | 'yaml' | 'shell'
  template: string
}

export interface ProjectMetadata {
  generatedAt: Date
  templateVersion: string
  agentWorkshopVersion: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  scripts: Record<string, string>
  buildInstructions: string[]
  deploymentOptions: string[]
}

export interface WizardStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  validation?: (config: Partial<AgentConfig>) => string[]
  isComplete: (config: Partial<AgentConfig>) => boolean
}

// Built-in tools available for agents
export const AVAILABLE_TOOLS: AgentTool[] = [
  // File Operations
  {
    id: 'read-file',
    name: 'Read File',
    description: 'Read contents of any file in the project',
    category: 'file',
    enabled: true,
  },
  {
    id: 'write-file', 
    name: 'Write File',
    description: 'Create new files with specified content',
    category: 'file',
    enabled: false,
  },
  {
    id: 'edit-file',
    name: 'Edit File', 
    description: 'Modify existing files with find-and-replace',
    category: 'file',
    enabled: false,
  },
  {
    id: 'find-files',
    name: 'Find Files',
    description: 'Search for files using glob patterns',
    category: 'file', 
    enabled: true,
  },
  {
    id: 'search-files',
    name: 'Search in Files',
    description: 'Search for text content across multiple files',
    category: 'file',
    enabled: true,
  },
  
  // Command Execution
  {
    id: 'run-command',
    name: 'Run Command',
    description: 'Execute shell commands and scripts',
    category: 'command',
    enabled: false,
  },
  {
    id: 'git-operations',
    name: 'Git Operations',
    description: 'Git commands for version control',
    category: 'command',
    enabled: false,
  },
  
  // Web Operations
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for information',
    category: 'web',
    enabled: false,
  },
  {
    id: 'web-fetch',
    name: 'Web Fetch',
    description: 'Fetch and analyze web page content',
    category: 'web',
    enabled: false,
  },
  
  // Database
  {
    id: 'database-query',
    name: 'Database Query',
    description: 'Query SQL databases',
    category: 'database',
    enabled: false,
  },
  
  // Integrations
  {
    id: 'api-client',
    name: 'API Client',
    description: 'Make HTTP requests to external APIs',
    category: 'integration',
    enabled: false,
  },
]

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'development-agent',
    name: 'Development Agent',
    description: 'Full-stack development assistant with file operations, build tools, and code analysis capabilities.',
    domain: 'development',
    icon: 'CodeBracketIcon',
    gradient: 'from-blue-500 to-cyan-600',
    defaultTools: ['read-file', 'write-file', 'edit-file', 'find-files', 'search-files', 'run-command', 'git-operations'],
    samplePrompts: [
      'Create a new React component with TypeScript',
      'Fix the build error in the authentication module', 
      'Add unit tests for the user service',
      'Refactor the database queries for better performance'
    ],
    codeTemplates: {},
    documentation: 'A comprehensive development assistant that can read, write, and modify code files, execute build commands, manage git repositories, and help with debugging and optimization.',
  },
  {
    id: 'business-agent',
    name: 'Business Agent', 
    description: 'Document analysis, workflow automation, and business process optimization assistant.',
    domain: 'business',
    icon: 'CogIcon',
    gradient: 'from-green-500 to-emerald-600',
    defaultTools: ['read-file', 'write-file', 'find-files', 'search-files', 'web-search', 'api-client'],
    samplePrompts: [
      'Analyze this quarterly report and summarize key metrics',
      'Create a workflow automation for invoice processing',
      'Research market trends for our product category',
      'Draft a business proposal based on the requirements document'
    ],
    codeTemplates: {},
    documentation: 'Specialized for business workflows, document processing, data analysis, and process automation. Can integrate with business APIs and generate reports.',
  },
  {
    id: 'creative-agent',
    name: 'Creative Agent',
    description: 'Content creation, marketing copy, social media, and creative writing assistance.',
    domain: 'creative', 
    icon: 'RocketLaunchIcon',
    gradient: 'from-purple-500 to-pink-600',
    defaultTools: ['read-file', 'write-file', 'find-files', 'web-search', 'web-fetch'],
    samplePrompts: [
      'Write engaging social media posts for our product launch',
      'Create SEO-optimized blog content on industry trends', 
      'Generate creative copy for email marketing campaigns',
      'Develop a content calendar for the next quarter'
    ],
    codeTemplates: {},
    documentation: 'Focused on content creation, copywriting, social media management, and creative projects. Includes web research capabilities for trend analysis.',
  },
]