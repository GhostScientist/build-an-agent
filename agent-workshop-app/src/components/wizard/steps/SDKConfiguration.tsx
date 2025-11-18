'use client'

import { motion } from 'framer-motion'
import { 
  CheckIcon,
  CpuChipIcon,
  KeyIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { AgentConfig, SDKProvider } from '@/types/agent'

interface SDKConfigurationProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

const sdkProviders = [
  {
    id: 'claude' as SDKProvider,
    name: 'Claude Agent SDK',
    description: 'Official Claude Agent SDK with built-in tools, streaming, and development-focused capabilities.',
    icon: '🧠',
    gradient: 'from-orange-500 to-red-600',
    pros: [
      'Built-in file operations and code tools',
      'Streaming responses and real-time interaction',
      'Optimized for development workflows',
      'Professional agent architecture'
    ],
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Latest model, best for coding' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable, higher cost' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest, most economical' }
    ],
    recommended: true,
    setupComplexity: 'Easy',
    pricing: 'Pay per token'
  },
  {
    id: 'openai' as SDKProvider,
    name: 'OpenAI',
    description: 'OpenAI GPT models with function calling capabilities for custom tool integration.',
    icon: '🤖',
    gradient: 'from-green-500 to-emerald-600',
    pros: [
      'Advanced function calling system',
      'Large ecosystem and community',
      'Multiple model options',
      'Well-documented APIs'
    ],
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4, faster and cheaper' },
      { id: 'gpt-4', name: 'GPT-4', description: 'Most capable OpenAI model' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' }
    ],
    recommended: false,
    setupComplexity: 'Medium',
    pricing: 'Pay per token'
  },
  {
    id: 'anthropic-direct' as SDKProvider,
    name: 'Anthropic Direct API',
    description: 'Direct integration with Anthropic API for custom implementations and advanced control.',
    icon: '⚙️',
    gradient: 'from-blue-500 to-cyan-600',
    pros: [
      'Maximum flexibility and control',
      'Direct API access',
      'Custom tool implementations',
      'Advanced configuration options'
    ],
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Latest model' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest' }
    ],
    recommended: false,
    setupComplexity: 'Advanced', 
    pricing: 'Pay per token'
  }
]

export function SDKConfiguration({ config, updateConfig, onNext }: SDKConfigurationProps) {
  const selectedProvider = sdkProviders.find(p => p.id === config.sdkProvider)

  const handleProviderSelect = (providerId: SDKProvider) => {
    const provider = sdkProviders.find(p => p.id === providerId)
    if (provider) {
      updateConfig({ 
        sdkProvider: providerId,
        model: provider.models[0].id // Set default model
      })
    }
  }

  const handleModelSelect = (modelId: string) => {
    updateConfig({ model: modelId })
  }

  return (
    <div className="space-y-8">
      {/* Provider Selection */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Choose Your AI Provider
          </h3>
          <p className="text-gray-600">
            Select the AI provider and model that best fits your needs and budget.
          </p>
        </div>

        <div className="grid gap-4">
          {sdkProviders.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                config.sdkProvider === provider.id
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleProviderSelect(provider.id)}
            >
              {provider.recommended && (
                <div className="absolute -top-2 left-4">
                  <span className="bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${provider.gradient} rounded-lg flex items-center justify-center text-2xl shrink-0`}>
                  {provider.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {provider.name}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                        <span>Setup: {provider.setupComplexity}</span>
                        <span>•</span>
                        <span>{provider.pricing}</span>
                      </div>
                    </div>
                    
                    {config.sdkProvider === provider.id && (
                      <CheckIcon className="w-6 h-6 text-primary-500" />
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">
                    {provider.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Key Benefits:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {provider.pros.slice(0, 2).map((pro, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Available Models:</h5>
                      <div className="space-y-1">
                        {provider.models.slice(0, 2).map(model => (
                          <div key={model.id} className="text-sm">
                            <span className="font-medium text-gray-700">{model.name}</span>
                            <span className="text-gray-500 ml-2">- {model.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      {selectedProvider && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <CpuChipIcon className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">
              Select Model
            </h4>
          </div>

          <div className="grid gap-3">
            {selectedProvider.models.map(model => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`p-4 text-left border rounded-lg transition-all hover:shadow-sm ${
                  config.model === model.id
                    ? 'border-primary-500 bg-white shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{model.name}</h5>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                  {config.model === model.id && (
                    <CheckIcon className="w-5 h-5 text-primary-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Advanced Settings */}
      {config.sdkProvider && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Advanced Settings
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="1000"
                max="8000"
                value={config.maxTokens || 4096}
                onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum tokens for responses (1000-8000)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused (0)</span>
                <span className="font-medium">{config.temperature || 0.7}</span>
                <span>Creative (1)</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* API Key Notice */}
      {config.sdkProvider && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900">API Key Required</h5>
              <p className="text-sm text-blue-700 mt-1">
                You'll need to provide your {selectedProvider?.name} API key when running the generated agent. 
                The agent will include configuration instructions for setting up authentication.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}