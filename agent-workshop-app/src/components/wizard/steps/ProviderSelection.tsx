'use client'

import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/outline'
import { AgentConfig, SDKProvider } from '@/types/agent'

interface ProviderSelectionProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void  // Not used but kept for interface consistency with other steps
}

const providers = [
  {
    id: 'claude' as SDKProvider,
    name: 'Claude Agent SDK',
    description: 'Full-featured TypeScript agent with built-in tools, streaming, and development-focused capabilities.',
    icon: null, // Will use SVG
    gradient: 'from-orange-500 to-red-600',
    highlights: [
      'Built-in file operations and code tools',
      'Streaming responses',
      'Professional agent architecture'
    ],
    setupInfo: 'Full project • TypeScript • npm install required',
    recommended: true,
    flowType: 'full' as const
  },
  {
    id: 'openai' as SDKProvider,
    name: 'OpenAI Agents SDK',
    description: 'OpenAI GPT models with the official Agents SDK for powerful agent development.',
    icon: null, // Will use SVG
    gradient: 'from-green-500 to-emerald-600',
    highlights: [
      'Official OpenAI agent framework',
      'Advanced function calling',
      'Large ecosystem'
    ],
    setupInfo: 'Full project • TypeScript • npm install required',
    recommended: false,
    flowType: 'full' as const
  },
  {
    id: 'copilot' as SDKProvider,
    name: 'GitHub Copilot SDK',
    description: 'Embed Copilot agentic workflows in your app. Uses the same runtime as GitHub Copilot CLI.',
    icon: null, // Will use SVG
    gradient: 'from-gray-700 to-gray-900',
    highlights: [
      'Same engine as Copilot CLI',
      'Automatic tool orchestration',
      'Multiple models via Copilot'
    ],
    setupInfo: 'Full project • TypeScript • Copilot subscription required',
    recommended: false,
    flowType: 'full' as const
  },
  {
    id: 'huggingface' as SDKProvider,
    name: 'HuggingFace Tiny Agents',
    description: 'Lightweight agent config that runs instantly. Perfect for quick prototypes and sharing on HuggingFace Hub.',
    icon: '🤗',
    gradient: 'from-yellow-500 to-amber-600',
    highlights: [
      'Zero build step - run instantly',
      'Publish to HuggingFace Hub',
      'Open-source models'
    ],
    setupInfo: 'Single-page setup • Config files only • Instant',
    recommended: false,
    flowType: 'lightweight' as const
  }
]

export function ProviderSelection({ config, updateConfig }: ProviderSelectionProps) {
  const handleProviderSelect = (providerId: SDKProvider) => {
    const provider = providers.find(p => p.id === providerId)
    if (provider) {
      updateConfig({
        sdkProvider: providerId,
        // Reset model when provider changes
        model: undefined
      })
      // Don't auto-advance - let user click Next to confirm their choice
      // This also ensures the state update has propagated before validation
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your AI Provider
        </h3>
        <p className="text-gray-600">
          This determines your agent's capabilities and how it will be deployed.
        </p>
      </div>

      <div className="grid gap-4">
        {providers.map((provider, index) => (
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
            {/* Badges */}
            <div className="absolute -top-2 left-4 flex space-x-2">
              {provider.recommended && (
                <span className="bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
              {provider.flowType === 'lightweight' && (
                <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Instant Setup
                </span>
              )}
            </div>

            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg flex items-center justify-center p-2 shrink-0">
                {provider.id === 'claude' ? (
                  <img src="/Anthropic icon - Slate.svg" alt="Anthropic" className="w-full h-full" />
                ) : provider.id === 'openai' ? (
                  <img src="/OpenAI-black-monoblossom.svg" alt="OpenAI" className="w-full h-full" />
                ) : provider.id === 'copilot' ? (
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                ) : (
                  <span className="text-3xl">{provider.icon}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {provider.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {provider.setupInfo}
                    </p>
                  </div>

                  {config.sdkProvider === provider.id && (
                    <CheckIcon className="w-6 h-6 text-primary-500" />
                  )}
                </div>

                <p className="text-gray-600 mb-3">
                  {provider.description}
                </p>

                <ul className="text-sm text-gray-600 space-y-1">
                  {provider.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Flow indicator */}
      {config.sdkProvider && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {config.sdkProvider === 'huggingface' ? '3' : '8'}
              </span>
            </div>
            <div>
              <p className="font-medium text-blue-900">
                {config.sdkProvider === 'huggingface'
                  ? 'Quick 3-Step Setup'
                  : 'Full 8-Step Configuration'}
              </p>
              <p className="text-sm text-blue-700">
                {config.sdkProvider === 'huggingface'
                  ? 'Provider → Configure Agent → Preview & Download'
                  : 'Provider → Domain → Template → Model → Tools → MCP → Settings → Preview'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
