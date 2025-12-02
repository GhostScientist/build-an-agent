import { create } from 'zustand'
import { AgentConfig, AgentDomain, SDKProvider, AgentInterface, AVAILABLE_TOOLS, MCPServer } from '@/types/agent'

interface AgentStore {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  resetConfig: () => void
  setDomain: (domain: AgentDomain) => void
  setTemplate: (templateId: string) => void
  setSDKProvider: (provider: SDKProvider) => void
  toggleTool: (toolId: string) => void
  // MCP Server methods
  addMCPServer: (server: MCPServer) => void
  updateMCPServer: (id: string, updates: Partial<MCPServer>) => void
  removeMCPServer: (id: string) => void
  toggleMCPServer: (id: string) => void
}

const initialConfig: Partial<AgentConfig> = {
  name: '',
  description: '',
  domain: undefined,
  templateId: undefined,
  sdkProvider: undefined,
  model: undefined,
  interface: 'cli',
  tools: AVAILABLE_TOOLS.map(tool => ({ ...tool, enabled: tool.enabled })),
  mcpServers: [],
  customInstructions: '',
  specialization: '',
  permissions: 'balanced',
  maxTokens: 4096,
  temperature: 0.7,
  projectName: '',
  packageName: '',
  version: '1.0.0',
  author: '',
  license: 'MIT',
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  config: initialConfig,
  
  updateConfig: (updates) => {
    set(state => ({
      config: { ...state.config, ...updates }
    }))
  },
  
  resetConfig: () => {
    set({ config: { ...initialConfig } })
  },
  
  setDomain: (domain) => {
    set(state => ({
      config: { ...state.config, domain }
    }))
  },
  
  setTemplate: (templateId) => {
    set(state => ({
      config: { ...state.config, templateId }
    }))
  },
  
  setSDKProvider: (provider) => {
    set(state => ({
      config: { ...state.config, sdkProvider: provider }
    }))
  },
  
  toggleTool: (toolId) => {
    set(state => {
      const tools = state.config.tools?.map(tool =>
        tool.id === toolId
          ? { ...tool, enabled: !tool.enabled }
          : tool
      ) || []

      return {
        config: {
          ...state.config,
          tools
        }
      }
    })
  },

  // MCP Server methods
  addMCPServer: (server) => {
    set(state => ({
      config: {
        ...state.config,
        mcpServers: [...(state.config.mcpServers || []), server]
      }
    }))
  },

  updateMCPServer: (id, updates) => {
    set(state => ({
      config: {
        ...state.config,
        mcpServers: state.config.mcpServers?.map(server =>
          server.id === id ? { ...server, ...updates } as MCPServer : server
        ) || []
      }
    }))
  },

  removeMCPServer: (id) => {
    set(state => ({
      config: {
        ...state.config,
        mcpServers: state.config.mcpServers?.filter(server => server.id !== id) || []
      }
    }))
  },

  toggleMCPServer: (id) => {
    set(state => ({
      config: {
        ...state.config,
        mcpServers: state.config.mcpServers?.map(server =>
          server.id === id ? { ...server, enabled: !server.enabled } : server
        ) || []
      }
    }))
  },
}))

// Helper functions for working with the store
export const getEnabledTools = (config: Partial<AgentConfig>) => {
  return config.tools?.filter(tool => tool.enabled) || []
}

export const getToolsByCategory = (config: Partial<AgentConfig>) => {
  const tools = config.tools || []
  return tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, typeof tools>)
}

export const validateConfig = (config: Partial<AgentConfig>): string[] => {
  const errors: string[] = []
  
  if (!config.name?.trim()) {
    errors.push('Agent name is required')
  }
  
  if (!config.domain) {
    errors.push('Domain selection is required')
  }
  
  if (!config.sdkProvider) {
    errors.push('AI provider selection is required')
  }
  
  if (!config.tools?.some(tool => tool.enabled)) {
    errors.push('At least one tool must be enabled')
  }
  
  if (!config.projectName?.trim()) {
    errors.push('Project name is required')
  }
  
  if (!config.author?.trim()) {
    errors.push('Author name is required')
  }
  
  // Validate project name format
  if (config.projectName && !/^[a-z][a-z0-9-]*$/.test(config.projectName)) {
    errors.push('Project name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens')
  }

  return errors
}

// MCP Server helper functions
export const getEnabledMCPServers = (config: Partial<AgentConfig>) => {
  return config.mcpServers?.filter(server => server.enabled) || []
}

export const getMCPServersByCategory = (config: Partial<AgentConfig>) => {
  const servers = config.mcpServers || []
  return servers.reduce((acc, server) => {
    // Group by transport type for display
    const category = server.transportType
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(server)
    return acc
  }, {} as Record<string, typeof servers>)
}

export const validateMCPServer = (server: MCPServer): string[] => {
  const errors: string[] = []

  if (!server.name?.trim()) {
    errors.push('Server name is required')
  }

  // Validate name format (lowercase, alphanumeric, hyphens)
  if (server.name && !/^[a-z][a-z0-9-]*$/.test(server.name)) {
    errors.push('Server name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens')
  }

  switch (server.transportType) {
    case 'stdio':
      if (!server.command?.trim()) {
        errors.push('Command is required for stdio transport')
      }
      break
    case 'http':
    case 'sse':
      if (!server.url?.trim()) {
        errors.push('URL is required')
      } else {
        try {
          // Allow ${VAR} placeholders in URL
          const urlToTest = server.url.replace(/\$\{[^}]+\}/g, 'placeholder')
          new URL(urlToTest)
        } catch {
          errors.push('Invalid URL format')
        }
      }
      break
    case 'sdk':
      if (!server.serverModule?.trim()) {
        errors.push('Server module path is required')
      }
      break
  }

  return errors
}