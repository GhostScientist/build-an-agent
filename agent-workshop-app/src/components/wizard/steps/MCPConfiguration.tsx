'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderIcon,
  CodeBracketIcon,
  CircleStackIcon,
  GlobeAltIcon,
  CloudIcon,
  ChatBubbleLeftRightIcon,
  CommandLineIcon,
  ServerIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import { AgentConfig, MCPServer, MCPServerCategory, MCPTransportType, MCPStdioServer, MCPHttpServer, MCPSseServer, MCPSdkServer } from '@/types/agent'
import { validateMCPServer } from '@/lib/store'
import { MCP_SERVER_TEMPLATES, MCP_CATEGORY_INFO } from '@/data/mcp-templates'

interface MCPConfigurationProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

const categoryIcons: Record<MCPServerCategory, React.ComponentType<{ className?: string }>> = {
  filesystem: FolderIcon,
  git: CodeBracketIcon,
  database: CircleStackIcon,
  api: GlobeAltIcon,
  cloud: CloudIcon,
  productivity: ChatBubbleLeftRightIcon,
  custom: CubeIcon,
}

const transportBadgeColors: Record<MCPTransportType, string> = {
  stdio: 'bg-blue-100 text-blue-700',
  http: 'bg-green-100 text-green-700',
  sse: 'bg-purple-100 text-purple-700',
  sdk: 'bg-orange-100 text-orange-700',
}

const transportLabels: Record<MCPTransportType, string> = {
  stdio: 'Stdio',
  http: 'HTTP',
  sse: 'SSE',
  sdk: 'SDK',
}

type EditingServer = {
  id: string
  name: string
  description: string
  transportType: MCPTransportType
  enabled: boolean
  // Stdio fields
  command?: string
  args?: string[]
  env?: Record<string, string>
  // HTTP/SSE fields
  url?: string
  headers?: Record<string, string>
  // SDK fields
  serverModule?: string
}

export function MCPConfiguration({ config, updateConfig }: MCPConfigurationProps) {
  const [selectedCategory, setSelectedCategory] = useState<MCPServerCategory | 'all'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingServerId, setEditingServerId] = useState<string | null>(null)
  const [expandedServer, setExpandedServer] = useState<string | null>(null)
  const [editingServer, setEditingServer] = useState<EditingServer | null>(null)

  const mcpServers = config.mcpServers || []

  const filteredTemplates = selectedCategory === 'all'
    ? MCP_SERVER_TEMPLATES
    : MCP_SERVER_TEMPLATES.filter(t => t.category === selectedCategory)

  const generateId = () => `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addServerFromTemplate = (templateId: string) => {
    const template = MCP_SERVER_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

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

    // Open the server for editing so user can customize
    setEditingServerId(newServer.id)
    setExpandedServer(newServer.id)
    setEditingServer(newServer as EditingServer)
    setIsAddModalOpen(false)
  }

  const removeServer = (id: string) => {
    updateConfig({
      mcpServers: mcpServers.filter(s => s.id !== id)
    })
    if (editingServerId === id) {
      setEditingServerId(null)
      setEditingServer(null)
    }
    if (expandedServer === id) {
      setExpandedServer(null)
    }
  }

  const toggleServer = (id: string) => {
    updateConfig({
      mcpServers: mcpServers.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    })
  }

  const startEditing = (server: MCPServer) => {
    setEditingServerId(server.id)
    setEditingServer({ ...server } as EditingServer)
    setExpandedServer(server.id)
  }

  const cancelEditing = () => {
    setEditingServerId(null)
    setEditingServer(null)
  }

  const saveEditing = () => {
    if (!editingServer || !editingServerId) return

    const errors = validateMCPServer(editingServer as MCPServer)
    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    updateConfig({
      mcpServers: mcpServers.map(s =>
        s.id === editingServerId ? editingServer as MCPServer : s
      )
    })
    setEditingServerId(null)
    setEditingServer(null)
  }

  const updateEditingServer = (updates: Partial<EditingServer>) => {
    if (!editingServer) return
    setEditingServer({ ...editingServer, ...updates })
  }

  const updateEditingEnv = (key: string, value: string) => {
    if (!editingServer) return
    const env = { ...(editingServer.env || {}) }
    if (value === '') {
      delete env[key]
    } else {
      env[key] = value
    }
    setEditingServer({ ...editingServer, env })
  }

  const addEnvVar = () => {
    if (!editingServer) return
    const env = { ...(editingServer.env || {}), '': '' }
    setEditingServer({ ...editingServer, env })
  }

  const updateEditingArgs = (index: number, value: string) => {
    if (!editingServer) return
    const args = [...(editingServer.args || [])]
    args[index] = value
    setEditingServer({ ...editingServer, args })
  }

  const addArg = () => {
    if (!editingServer) return
    const args = [...(editingServer.args || []), '']
    setEditingServer({ ...editingServer, args })
  }

  const removeArg = (index: number) => {
    if (!editingServer) return
    const args = [...(editingServer.args || [])]
    args.splice(index, 1)
    setEditingServer({ ...editingServer, args })
  }

  const renderServerForm = (server: EditingServer) => {
    return (
      <div className="space-y-4 pt-4 border-t border-gray-200">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Server Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={server.name}
            onChange={(e) => updateEditingServer({ name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            placeholder="my-server"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={server.description || ''}
            onChange={(e) => updateEditingServer({ description: e.target.value })}
            placeholder="What does this server do?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Transport Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transport Type
          </label>
          <select
            value={server.transportType}
            onChange={(e) => updateEditingServer({ transportType: e.target.value as MCPTransportType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="stdio">Stdio (Local Command)</option>
            <option value="http">HTTP (REST Endpoint)</option>
            <option value="sse">SSE (Server-Sent Events)</option>
            <option value="sdk">SDK (In-Process Module)</option>
          </select>
        </div>

        {/* Transport-specific fields */}
        {server.transportType === 'stdio' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Command <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={server.command || ''}
                onChange={(e) => updateEditingServer({ command: e.target.value })}
                placeholder="npx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arguments
              </label>
              <div className="space-y-2">
                {(server.args || []).map((arg, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={arg}
                      onChange={(e) => updateEditingArgs(index, e.target.value)}
                      placeholder={`Argument ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={() => removeArg(index)}
                      className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addArg}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Add argument
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment Variables
              </label>
              <div className="space-y-2">
                {Object.entries(server.env || {}).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newEnv = { ...(server.env || {}) }
                        const oldValue = newEnv[key]
                        delete newEnv[key]
                        newEnv[e.target.value] = oldValue
                        updateEditingServer({ env: newEnv })
                      }}
                      placeholder="KEY"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateEditingEnv(key, e.target.value)}
                      placeholder="${ENV_VAR}"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    />
                    <button
                      onClick={() => updateEditingEnv(key, '')}
                      className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addEnvVar}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Add environment variable
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use {'${VAR_NAME}'} syntax to reference environment variables at runtime
              </p>
            </div>
          </>
        )}

        {(server.transportType === 'http' || server.transportType === 'sse') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={server.url || ''}
                onChange={(e) => updateEditingServer({ url: e.target.value })}
                placeholder="http://localhost:8080"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headers
              </label>
              <div className="space-y-2">
                {Object.entries(server.headers || {}).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newHeaders = { ...(server.headers || {}) }
                        const oldValue = newHeaders[key]
                        delete newHeaders[key]
                        newHeaders[e.target.value] = oldValue
                        updateEditingServer({ headers: newHeaders })
                      }}
                      placeholder="Header-Name"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const headers = { ...(server.headers || {}), [key]: e.target.value }
                        updateEditingServer({ headers })
                      }}
                      placeholder="Header value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={() => {
                        const headers = { ...(server.headers || {}) }
                        delete headers[key]
                        updateEditingServer({ headers })
                      }}
                      className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const headers = { ...(server.headers || {}), '': '' }
                    updateEditingServer({ headers })
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Add header
                </button>
              </div>
            </div>
          </>
        )}

        {server.transportType === 'sdk' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={server.serverModule || ''}
              onChange={(e) => updateEditingServer({ serverModule: e.target.value })}
              placeholder="./custom-mcp-server.js"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Path to a JavaScript module exporting an MCP server
            </p>
          </div>
        )}

        {/* Save/Cancel buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={cancelEditing}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={saveEditing}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg"
      >
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold text-blue-900 mb-1">Model Context Protocol (MCP)</h5>
            <p className="text-sm text-blue-800">
              MCP servers extend your agent's capabilities with external tools and data sources.
              Add servers from the templates below or configure custom connections.
              Servers can be managed later via the <code className="bg-blue-100 px-1 rounded">.mcp.json</code> file or CLI commands.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configure MCP Servers
        </h3>
        <p className="text-gray-600">
          Connect to Model Context Protocol servers for additional capabilities. This step is optional.
        </p>
      </div>

      {/* Configured Servers */}
      {mcpServers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Configured Servers
            </h4>
            <div className="text-sm text-gray-500">
              {mcpServers.filter(s => s.enabled).length} / {mcpServers.length} enabled
            </div>
          </div>

          <div className="space-y-3">
            {mcpServers.map((server) => {
              const isEditing = editingServerId === server.id
              const isExpanded = expandedServer === server.id

              return (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-xl p-4 ${
                    server.enabled ? 'border-primary-200 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleServer(server.id)}
                        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          server.enabled
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {server.enabled && <CheckIcon className="w-3 h-3 text-white" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{server.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${transportBadgeColors[server.transportType]}`}>
                            {transportLabels[server.transportType]}
                          </span>
                        </div>
                        {server.description && (
                          <p className="text-sm text-gray-500">{server.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => isExpanded ? setExpandedServer(null) : setExpandedServer(server.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => isEditing ? cancelEditing() : startEditing(server)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeServer(server.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {isEditing && editingServer ? (
                          renderServerForm(editingServer)
                        ) : (
                          <div className="pt-4 border-t border-gray-200 mt-4">
                            <dl className="grid grid-cols-2 gap-2 text-sm">
                              {server.transportType === 'stdio' && (
                                <>
                                  <dt className="text-gray-500">Command:</dt>
                                  <dd className="text-gray-900 font-mono">{(server as MCPStdioServer).command}</dd>
                                  {(server as MCPStdioServer).args?.length ? (
                                    <>
                                      <dt className="text-gray-500">Args:</dt>
                                      <dd className="text-gray-900 font-mono text-xs">{(server as MCPStdioServer).args?.join(' ')}</dd>
                                    </>
                                  ) : null}
                                </>
                              )}
                              {(server.transportType === 'http' || server.transportType === 'sse') && (
                                <>
                                  <dt className="text-gray-500">URL:</dt>
                                  <dd className="text-gray-900 font-mono text-xs break-all">{(server as MCPHttpServer | MCPSseServer).url}</dd>
                                </>
                              )}
                              {server.transportType === 'sdk' && (
                                <>
                                  <dt className="text-gray-500">Module:</dt>
                                  <dd className="text-gray-900 font-mono text-xs">{(server as MCPSdkServer).serverModule}</dd>
                                </>
                              )}
                            </dl>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Server Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Add MCP Server
          </h4>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(MCP_CATEGORY_INFO).map(([category, info]) => {
            const Icon = categoryIcons[category as MCPServerCategory]
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as MCPServerCategory)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === category
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {info.label}
              </button>
            )
          })}
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTemplates.map((template) => {
            const Icon = categoryIcons[template.category] || CubeIcon
            const isAlreadyAdded = mcpServers.some(s => s.name === template.id)

            return (
              <button
                key={template.id}
                onClick={() => !isAlreadyAdded && addServerFromTemplate(template.id)}
                disabled={isAlreadyAdded}
                className={`p-4 text-left border rounded-xl transition-all ${
                  isAlreadyAdded
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isAlreadyAdded ? 'bg-gray-200' : 'bg-gray-100'}`}>
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{template.name}</span>
                      {isAlreadyAdded && (
                        <span className="text-xs text-green-600">Added</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                    <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      transportBadgeColors[template.defaultConfig.transportType as MCPTransportType]
                    }`}>
                      {transportLabels[template.defaultConfig.transportType as MCPTransportType]}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {mcpServers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
        >
          <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-1">No MCP servers configured</h4>
          <p className="text-sm text-gray-500 mb-4">
            Select a template above to add your first MCP server, or skip this step.
          </p>
        </motion.div>
      )}

      {/* Summary */}
      {mcpServers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900">MCP Configuration Summary</h5>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
                <p>Total Servers: <span className="font-medium">{mcpServers.length}</span></p>
                <p>Enabled: <span className="font-medium">{mcpServers.filter(s => s.enabled).length}</span></p>
                <p>Transport Types: <span className="font-medium">
                  {Array.from(new Set(mcpServers.map(s => transportLabels[s.transportType]))).join(', ') || 'None'}
                </span></p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
