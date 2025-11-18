'use client'

import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  CommandLineIcon,
  GlobeAltIcon,
  CircleStackIcon,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { AgentConfig, AgentTool } from '@/types/agent'
import { getToolsByCategory } from '@/lib/store'

interface ToolConfigurationProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

const categoryIcons = {
  file: DocumentTextIcon,
  command: CommandLineIcon,
  web: GlobeAltIcon,
  database: CircleStackIcon,
  integration: PuzzlePieceIcon,
  custom: WrenchScrewdriverIcon,
}

const categoryDescriptions = {
  file: 'Read, write, edit, and search files in the project',
  command: 'Execute shell commands, run builds, and manage processes',
  web: 'Search the web, fetch content, and analyze online resources',
  database: 'Connect to and query various database systems',
  integration: 'Integrate with external APIs and services',
  custom: 'Custom tools and specialized functionality',
}

const riskLevels = {
  low: { color: 'green', label: 'Low Risk' },
  medium: { color: 'yellow', label: 'Medium Risk' },
  high: { color: 'red', label: 'High Risk' },
}

const toolRisks: Record<string, keyof typeof riskLevels> = {
  'read-file': 'low',
  'find-files': 'low',
  'search-files': 'low',
  'write-file': 'medium',
  'edit-file': 'medium',
  'run-command': 'high',
  'git-operations': 'medium',
  'web-search': 'low',
  'web-fetch': 'low',
  'database-query': 'medium',
  'api-client': 'medium',
}

export function ToolConfiguration({ config, updateConfig, onNext }: ToolConfigurationProps) {
  const toolsByCategory = getToolsByCategory(config)
  const enabledTools = config.tools?.filter(t => t.enabled) || []

  const toggleTool = (toolId: string) => {
    const updatedTools = config.tools?.map(tool => 
      tool.id === toolId 
        ? { ...tool, enabled: !tool.enabled }
        : tool
    ) || []
    
    updateConfig({ tools: updatedTools })
  }

  const toggleCategory = (category: string) => {
    const categoryTools = toolsByCategory[category] || []
    const allEnabled = categoryTools.every(tool => tool.enabled)
    
    const updatedTools = config.tools?.map(tool => 
      categoryTools.some(ct => ct.id === tool.id)
        ? { ...tool, enabled: !allEnabled }
        : tool
    ) || []
    
    updateConfig({ tools: updatedTools })
  }

  const setPermissionLevel = (level: AgentConfig['permissions']) => {
    updateConfig({ permissions: level })
    
    // Auto-configure tools based on permission level
    if (level === 'restrictive') {
      // Only enable read-only tools
      const updatedTools = config.tools?.map(tool => ({
        ...tool,
        enabled: ['read-file', 'find-files', 'search-files', 'web-search'].includes(tool.id)
      })) || []
      updateConfig({ tools: updatedTools })
    } else if (level === 'permissive') {
      // Enable all tools
      const updatedTools = config.tools?.map(tool => ({
        ...tool,
        enabled: true
      })) || []
      updateConfig({ tools: updatedTools })
    }
  }

  return (
    <div className="space-y-8">
      {/* Permission Level */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configure Agent Capabilities
          </h3>
          <p className="text-gray-600">
            Select the tools and permissions your agent needs. Start with a permission level, then customize individual tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              level: 'restrictive' as const,
              name: 'Restrictive',
              description: 'Read-only access, web search only. Safest option.',
              icon: '🔒',
              tools: ['Read files', 'Search files', 'Web search']
            },
            {
              level: 'balanced' as const, 
              name: 'Balanced',
              description: 'File operations with manual approval for commands. Recommended.',
              icon: '⚖️',
              tools: ['File ops', 'Web access', 'Some commands']
            },
            {
              level: 'permissive' as const,
              name: 'Permissive', 
              description: 'Full access to all tools. Maximum capability.',
              icon: '🚀',
              tools: ['All capabilities', 'Command execution', 'Database access']
            }
          ].map(option => (
            <button
              key={option.level}
              onClick={() => setPermissionLevel(option.level)}
              className={`p-4 text-left border-2 rounded-xl transition-all hover:shadow-md ${
                config.permissions === option.level
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{option.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{option.description}</p>
              <div className="flex flex-wrap gap-1">
                {option.tools.map(tool => (
                  <span key={tool} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {tool}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tool Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Available Tools
          </h4>
          <div className="text-sm text-gray-500">
            {enabledTools.length} tools selected
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(toolsByCategory).map(([category, tools]) => {
            if (tools.length === 0) return null
            
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons]
            const allEnabled = tools.every(tool => tool.enabled)
            const someEnabled = tools.some(tool => tool.enabled)
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                    <div>
                      <h5 className="font-semibold text-gray-900 capitalize">
                        {category} Operations
                      </h5>
                      <p className="text-sm text-gray-600">
                        {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      allEnabled
                        ? 'bg-green-100 text-green-700'
                        : someEnabled
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {allEnabled ? 'All Enabled' : someEnabled ? 'Partial' : 'Enable All'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {tools.map(tool => {
                    const risk = toolRisks[tool.id] || 'low'
                    const riskConfig = riskLevels[risk]
                    
                    return (
                      <div
                        key={tool.id}
                        className={`p-4 border rounded-lg transition-all ${
                          tool.enabled
                            ? 'border-primary-200 bg-white shadow-sm'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h6 className="font-medium text-gray-900">{tool.name}</h6>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${riskConfig.color}-100 text-${riskConfig.color}-700`}>
                                {riskConfig.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{tool.description}</p>
                          </div>
                          
                          <button
                            onClick={() => toggleTool(tool.id)}
                            className={`ml-3 w-5 h-5 rounded border-2 transition-all ${
                              tool.enabled
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {tool.enabled && (
                              <CheckIcon className="w-3 h-3 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Warnings */}
      {enabledTools.some(t => toolRisks[t.id] === 'high') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h5 className="font-medium text-amber-900">High-Risk Tools Enabled</h5>
              <p className="text-sm text-amber-700 mt-1">
                You've enabled tools that can execute commands on your system. Make sure you trust 
                the AI provider and understand the potential risks before using these capabilities.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom Instructions */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Custom Instructions (Optional)
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={config.customInstructions || ''}
              onChange={(e) => updateConfig({ customInstructions: e.target.value })}
              placeholder="Add any special instructions or constraints for your agent..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              These instructions will be included in your agent's system prompt
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">Configuration Summary</h5>
            <div className="text-sm text-blue-700 mt-1 space-y-1">
              <p>Permission Level: <span className="font-medium capitalize">{config.permissions}</span></p>
              <p>Tools Enabled: <span className="font-medium">{enabledTools.length}</span></p>
              <p>Risk Level: <span className="font-medium">
                {enabledTools.some(t => toolRisks[t.id] === 'high') ? 'High' : 
                 enabledTools.some(t => toolRisks[t.id] === 'medium') ? 'Medium' : 'Low'}
              </span></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}