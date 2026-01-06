'use client'

import { motion } from 'framer-motion'
import {
  CheckIcon,
  CpuChipIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { AgentConfig, SDKProvider } from '@/types/agent'

interface SDKConfigurationProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

// Model definitions per provider
const modelsByProvider: Record<SDKProvider, Array<{
  id: string
  name: string
  description: string
  pricing: string
  contextWindow: string
}>> = {
  claude: [
    {
      id: 'claude-sonnet-4-5-20250929',
      name: 'Claude Sonnet 4.5 (Latest)',
      description: 'Our smartest model for complex agents and coding',
      pricing: '$3 / MTok in, $15 / MTok out',
      contextWindow: '200K'
    },
    {
      id: 'claude-haiku-4-5-20251001',
      name: 'Claude Haiku 4.5',
      description: 'Our fastest model with near-frontier intelligence',
      pricing: '$1 / MTok in, $5 / MTok out',
      contextWindow: '200K'
    },
    {
      id: 'claude-opus-4-1-20250805',
      name: 'Claude Opus 4.1',
      description: 'Exceptional model for specialized reasoning tasks',
      pricing: '$15 / MTok in, $75 / MTok out',
      contextWindow: '200K'
    }
  ],
  openai: [
    {
      id: 'gpt-5.1',
      name: 'GPT-5.1 (Latest)',
      description: 'The best model for coding and agentic tasks with configurable reasoning effort',
      pricing: 'Variable pricing',
      contextWindow: '128K'
    },
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 mini',
      description: 'A faster, cost-efficient version of GPT-5 for well-defined tasks',
      pricing: 'Variable pricing',
      contextWindow: '128K'
    },
    {
      id: 'gpt-5-nano',
      name: 'GPT-5 nano',
      description: 'Fastest, most cost-efficient version of GPT-5',
      pricing: 'Variable pricing',
      contextWindow: '128K'
    },
    {
      id: 'gpt-5-pro',
      name: 'GPT-5 pro',
      description: 'Version of GPT-5 that produces smarter and more precise responses',
      pricing: 'Variable pricing',
      contextWindow: '128K'
    },
    {
      id: 'gpt-5',
      name: 'GPT-5',
      description: 'Previous intelligent reasoning model for coding and agentic tasks',
      pricing: 'Variable pricing',
      contextWindow: '128K'
    },
    {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      description: 'Smartest non-reasoning model',
      pricing: 'Variable pricing',
      contextWindow: '128K'
    }
  ],
  huggingface: [
    {
      id: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
      name: 'Qwen 3 235B Instruct',
      description: 'Most capable open-source model with tool support',
      pricing: 'Pay-per-use via HuggingFace',
      contextWindow: '128K'
    },
    {
      id: 'Qwen/Qwen3-32B',
      name: 'Qwen 3 32B',
      description: 'Fast and capable with tool support',
      pricing: 'Pay-per-use via HuggingFace',
      contextWindow: '128K'
    },
    {
      id: 'meta-llama/Llama-3.3-70B-Instruct',
      name: 'Llama 3.3 70B',
      description: 'Popular open-source model from Meta',
      pricing: 'Pay-per-use via HuggingFace',
      contextWindow: '128K'
    },
    {
      id: 'deepseek-ai/DeepSeek-R1',
      name: 'DeepSeek R1',
      description: 'Specialized in reasoning tasks',
      pricing: 'Pay-per-use via HuggingFace',
      contextWindow: '64K'
    },
    {
      id: 'deepseek-ai/DeepSeek-V3-0324',
      name: 'DeepSeek V3',
      description: 'Powerful general-purpose model',
      pricing: 'Pay-per-use via HuggingFace',
      contextWindow: '64K'
    }
  ]
}

const providerNames: Record<SDKProvider, string> = {
  claude: 'Claude',
  openai: 'OpenAI',
  huggingface: 'HuggingFace'
}

export function SDKConfiguration({ config, updateConfig }: SDKConfigurationProps) {
  const provider = config.sdkProvider as SDKProvider
  const models = provider ? modelsByProvider[provider] : []

  const handleModelSelect = (modelId: string) => {
    updateConfig({ model: modelId })
  }

  // Auto-select first model if none selected
  if (provider && !config.model && models.length > 0) {
    updateConfig({ model: models[0].id })
  }

  return (
    <div className="space-y-8">
      {/* Provider indicator */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center p-2">
          {provider === 'claude' ? (
            <img src="/Anthropic icon - Slate.svg" alt="Anthropic" className="w-full h-full" />
          ) : provider === 'openai' ? (
            <img src="/OpenAI-black-monoblossom.svg" alt="OpenAI" className="w-full h-full" />
          ) : (
            <span className="text-2xl">🤗</span>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{providerNames[provider]} Agent SDK</p>
          <p className="text-sm text-gray-500">Select your model and configure settings</p>
        </div>
      </div>

      {/* Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <CpuChipIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-semibold text-gray-900">
            Select Model
          </h4>
        </div>

        <div className="grid gap-3">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
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
                    {model.contextWindow && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {model.contextWindow}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{model.description}</p>
                  {model.pricing && (
                    <p className="text-xs font-mono text-gray-500">{model.pricing}</p>
                  )}
                </div>
                {config.model === model.id && (
                  <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Advanced Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Advanced Settings
        </h4>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Tokens
              </label>
              <div className="group relative">
                <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  <p className="font-semibold mb-1">Max Tokens</p>
                  <p>The maximum number of tokens (words/characters) the AI can generate in a single response. Higher values allow longer responses but cost more. 1 token ≈ 4 characters.</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <input
              type="number"
              min="1000"
              max="8000"
              value={config.maxTokens || 4096}
              onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Range: 1000-8000 (Default: 4096)
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Temperature
              </label>
              <div className="group relative">
                <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  <p className="font-semibold mb-1">Temperature</p>
                  <p>Controls randomness in responses. Lower values (0-0.3) make output more focused and deterministic. Higher values (0.7-1.0) make it more creative and varied. Use 0.7 for balanced results.</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
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

      {/* API Key Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">API Key Required</h5>
            <p className="text-sm text-blue-700 mt-1">
              You'll need to provide your {providerNames[provider]} API key when running the generated agent.
              The agent will include configuration instructions for setting up authentication.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
