'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
  ServerIcon,
} from '@heroicons/react/24/outline'
import { AgentConfig, MCPServer, MCPServerTemplate } from '@/types/agent'
import { MCP_SERVER_TEMPLATES } from '@/data/mcp-templates'

interface HuggingFaceQuickFormProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

const HUGGINGFACE_MODELS = [
  {
    id: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    name: 'Qwen 3 235B Instruct',
    description: 'Most capable open-source model with excellent tool support',
    contextWindow: '128K'
  },
  {
    id: 'Qwen/Qwen3-32B',
    name: 'Qwen 3 32B',
    description: 'Fast and capable with good tool support',
    contextWindow: '128K'
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B',
    description: 'Popular open-source model from Meta',
    contextWindow: '128K'
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    description: 'Specialized in reasoning tasks',
    contextWindow: '64K'
  },
  {
    id: 'deepseek-ai/DeepSeek-V3-0324',
    name: 'DeepSeek V3',
    description: 'Powerful general-purpose model',
    contextWindow: '64K'
  }
]

// Popular MCP servers for quick-add (verified working packages)
const POPULAR_MCP_SERVERS = [
  'playwright',
  'github',
  'filesystem',
  'memory',
  'sequential-thinking',
  'brave-search'
]

export function HuggingFaceQuickForm({ config, updateConfig, onNext }: HuggingFaceQuickFormProps) {
  const [showMCPSection, setShowMCPSection] = useState(false)
  const [showAllTemplates, setShowAllTemplates] = useState(false)

  // Auto-apply defaults on mount
  useEffect(() => {
    const defaults: Partial<AgentConfig> = {}

    if (!config.domain) defaults.domain = 'development'
    if (!config.version) defaults.version = '1.0.0'
    if (!config.license) defaults.license = 'MIT'
    if (!config.permissions) defaults.permissions = 'balanced'
    if (!config.tools) defaults.tools = []
    if (!config.model) defaults.model = HUGGINGFACE_MODELS[0].id

    if (Object.keys(defaults).length > 0) {
      updateConfig(defaults)
    }
  }, [])

  // Auto-generate projectName from name
  useEffect(() => {
    if (config.name) {
      const projectName = config.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      updateConfig({
        projectName,
        packageName: projectName
      })
    }
  }, [config.name])

  const mcpServers = config.mcpServers || []

  const generateId = () => `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addServerFromTemplate = (templateId: string) => {
    const template = MCP_SERVER_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    // Check if already added
    if (mcpServers.some(s => s.name === template.id)) return

    const newServer: MCPServer = {
      id: generateId(),
      name: template.id,
      description: template.description,
      enabled: true,
      ...template.defaultConfig,
    } as MCPServer

    updateConfig({
      mcpServers: [...mcpServers, newServer]
    })
  }

  const removeServer = (id: string) => {
    updateConfig({
      mcpServers: mcpServers.filter(s => s.id !== id)
    })
  }

  const popularTemplates = MCP_SERVER_TEMPLATES.filter(t =>
    POPULAR_MCP_SERVERS.includes(t.id)
  )

  const isValid = !!(config.name?.trim() && config.model)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-4">
          <span className="text-xl">🤗</span>
          <span className="font-medium">HuggingFace Tiny Agent</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Configure Your Agent
        </h3>
        <p className="text-gray-600">
          Set up your lightweight agent in one simple form. No build step required!
        </p>
      </div>

      {/* Agent Identity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Agent Identity</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.name || ''}
              onChange={(e) => updateConfig({ name: e.target.value })}
              placeholder="My Awesome Agent"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {config.name && (
              <p className="text-xs text-gray-500 mt-1">
                Will be published as: <code className="bg-gray-100 px-1 rounded">{config.projectName}</code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={config.description || ''}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="Describe what your agent does..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Model Selection Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Model Selection</h4>

        <div className="grid gap-3">
          {HUGGINGFACE_MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => updateConfig({ model: model.id })}
              className={`p-4 text-left border rounded-lg transition-all hover:shadow-sm ${
                config.model === model.id
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900">{model.name}</h5>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {model.contextWindow}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{model.description}</p>
                </div>
                {config.model === model.id && (
                  <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* MCP Servers Section (Collapsible) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <button
          onClick={() => setShowMCPSection(!showMCPSection)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ServerIcon className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <h4 className="text-lg font-semibold text-gray-900">MCP Servers</h4>
              <p className="text-sm text-gray-500">
                {mcpServers.length > 0
                  ? `${mcpServers.length} server${mcpServers.length > 1 ? 's' : ''} configured`
                  : 'Optional - Add external tool integrations'}
              </p>
            </div>
          </div>
          {showMCPSection ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showMCPSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200"
            >
              <div className="p-6 space-y-4">
                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    MCP servers extend your agent's capabilities with external tools like file access, web search, and databases.
                  </p>
                </div>

                {/* Added servers */}
                {mcpServers.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Added Servers</h5>
                    {mcpServers.map(server => (
                      <div
                        key={server.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">{server.name}</span>
                          <p className="text-xs text-gray-500">{server.description}</p>
                        </div>
                        <button
                          onClick={() => removeServer(server.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular servers quick-add */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Quick Add Popular Servers</h5>
                  <div className="flex flex-wrap gap-2">
                    {popularTemplates.map(template => {
                      const isAdded = mcpServers.some(s => s.name === template.id)
                      return (
                        <button
                          key={template.id}
                          onClick={() => !isAdded && addServerFromTemplate(template.id)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center space-x-1 ${
                            isAdded
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isAdded ? (
                            <CheckIcon className="w-3.5 h-3.5" />
                          ) : (
                            <PlusIcon className="w-3.5 h-3.5" />
                          )}
                          <span>{template.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Show more templates */}
                <button
                  onClick={() => setShowAllTemplates(!showAllTemplates)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showAllTemplates ? 'Show less' : 'Show all available servers...'}
                </button>

                <AnimatePresence>
                  {showAllTemplates && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 gap-2"
                    >
                      {MCP_SERVER_TEMPLATES.filter(t => !POPULAR_MCP_SERVERS.includes(t.id)).map(template => {
                        const isAdded = mcpServers.some(s => s.name === template.id)
                        return (
                          <button
                            key={template.id}
                            onClick={() => !isAdded && addServerFromTemplate(template.id)}
                            disabled={isAdded}
                            className={`p-2 text-left text-sm rounded-lg transition-colors ${
                              isAdded
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                            }`}
                          >
                            <span className="font-medium">{template.name}</span>
                            {isAdded && (
                              <CheckIcon className="w-3.5 h-3.5 text-green-600 inline ml-1" />
                            )}
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Validation message */}
      {!isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700"
        >
          Please provide an agent name and select a model to continue.
        </motion.div>
      )}
    </div>
  )
}
