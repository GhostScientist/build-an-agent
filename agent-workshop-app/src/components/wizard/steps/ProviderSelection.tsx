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
    description: 'Drives the Copilot CLI runtime. Requires Copilot access through a supported login or token; usage limits and organization policies apply.',
    icon: null, // Will use SVG
    gradient: 'from-slate-700 to-gray-900',
    highlights: [
      'Copilot CLI login or supported GitHub token',
      'Built-in file, search and shell tools',
      'Reads .github/copilot-instructions.md and AGENTS.md'
    ],
    setupInfo: 'Full project • TypeScript • See generated Node.js requirements',
    recommended: false,
    flowType: 'full' as const
  },
  {
    id: 'huggingface' as SDKProvider,
    name: 'HuggingFace Tiny Agents',
    description: 'Lightweight configuration for the tiny-agents runtime. Requires inference access and any configured MCP servers.',
    icon: '🤗',
    gradient: 'from-yellow-500 to-amber-600',
    highlights: [
      'No local build step; runtime downloaded separately',
      'Publish to HuggingFace Hub',
      'Open-source models'
    ],
    setupInfo: 'Single-page setup • Config files only • External runtime',
    recommended: false,
    flowType: 'lightweight' as const
  }
]

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

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
                  Config-only Setup
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
                  <GitHubMark className="w-full h-full text-gray-900" />
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
