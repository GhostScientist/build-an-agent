import { create } from 'zustand'
import { AgentConfig, AgentDomain, SDKProvider, AgentInterface, AVAILABLE_TOOLS } from '@/types/agent'

interface AgentStore {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  resetConfig: () => void
  setDomain: (domain: AgentDomain) => void
  setTemplate: (templateId: string) => void
  setSDKProvider: (provider: SDKProvider) => void
  toggleTool: (toolId: string) => void
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