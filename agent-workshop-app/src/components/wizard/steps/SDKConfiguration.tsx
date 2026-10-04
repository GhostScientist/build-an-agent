'use client'

import { motion } from 'framer-motion'
import {
  CheckIcon,
  CpuChipIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { AgentConfig, SDKProvider } from '@/types/agent'
import { modelsByProvider, modelDocs } from '@/data/models'

interface SDKConfigurationProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

const providerNames: Record<SDKProvider, string> = {
  claude: 'Claude',
  openai: 'OpenAI',
  huggingface: 'HuggingFace',
  copilot: 'GitHub Copilot'
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
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
          ) : provider === 'copilot' ? (
            <GitHubMark className="w-full h-full text-gray-900" />
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

        <p className="text-sm text-gray-600 mb-4">
          Curated examples, not a live catalogue. Availability, context limits, tool support,
          and pricing depend on your account and provider. Check{' '}
          <a href={modelDocs[provider]} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
            current provider documentation
          </a>{' '}
          before running. For other models, edit the model in the generated agent source.
        </p>
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
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{model.description}</p>
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
          Model-specific settings
        </h4>

        <p className="text-sm text-gray-600">
          This scaffold does not apply temperature or output-token controls.
          Configure supported settings in the generated SDK call after checking your model&apos;s
          documentation. Reasoning budgets, output limits, and sampling options are not interchangeable.
        </p>
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
          {provider === 'copilot' ? (
            <div>
              <h5 className="font-medium text-blue-900">GitHub Copilot Subscription Required</h5>
              <p className="text-sm text-blue-700 mt-1">
                No API key needed. The generated agent reuses your existing Copilot CLI or{' '}
                <code className="font-mono">gh</code> CLI login, or a{' '}
                <code className="font-mono">GITHUB_TOKEN</code> with Copilot access.
                Copilot access, organization policies, and usage charges apply.
              </p>
            </div>
          ) : (
            <div>
              <h5 className="font-medium text-blue-900">API Key Required</h5>
              <p className="text-sm text-blue-700 mt-1">
                You'll need to provide your {providerNames[provider]} API key when running the generated agent.
                The agent will include configuration instructions for setting up authentication.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
