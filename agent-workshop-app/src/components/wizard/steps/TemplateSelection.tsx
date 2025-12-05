'use client'

import { motion } from 'framer-motion'
import { 
  CodeBracketIcon,
  CogIcon,
  RocketLaunchIcon,
  CheckIcon,
  StarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { AgentConfig, AVAILABLE_TOOLS } from '@/types/agent'
import { AGENT_TEMPLATES } from '@/types/agent'

interface TemplateSelectionProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

const iconMap = {
  CodeBracketIcon,
  CogIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
}

export function TemplateSelection({ config, updateConfig, onNext }: TemplateSelectionProps) {
  // Filter templates by selected domain
  const filteredTemplates = config.domain 
    ? AGENT_TEMPLATES.filter(template => template.domain === config.domain)
    : AGENT_TEMPLATES

  const handleTemplateSelect = (templateId: string) => {
    const template = AGENT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      const baseTools = config.tools && config.tools.length > 0 ? config.tools : AVAILABLE_TOOLS
      const toolsWithDefaults = baseTools.map(tool => ({
        ...tool,
        enabled: template.defaultTools.includes(tool.id)
      }))

      // Update config with template defaults
      updateConfig({
        templateId,
        name: config.name || `${template.name}`,
        description: config.description || template.description,
        customInstructions: template.documentation,
        tools: toolsWithDefaults,
        // Keep existing permission choice, otherwise start safer for knowledge work
        permissions: config.permissions || (template.domain === 'development' ? 'balanced' : 'restrictive')
      })
      
      // Auto-advance after selection
      setTimeout(() => {
        onNext()
      }, 500)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Starting Template
        </h3>
        <p className="text-gray-600">
          Templates provide pre-configured tools and capabilities tailored for specific use cases.
          {config.domain && (
            <span className="block mt-1 text-primary-600 font-medium">
              Showing templates for: {config.domain.charAt(0).toUpperCase() + config.domain.slice(1)}
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6">
        {filteredTemplates.map((template, index) => {
          const IconComponent = iconMap[template.icon as keyof typeof iconMap] || CodeBracketIcon
          const isSelected = config.templateId === template.id
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg group ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="flex items-start space-x-6">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${template.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="capitalize">{template.domain}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>Featured</span>
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="text-primary-500">
                        <CheckIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Sample Prompts */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      What you can ask this agent:
                    </h5>
                    <div className="space-y-2">
                      {template.samplePrompts.slice(0, 2).map((prompt, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start space-x-2 text-sm text-gray-600"
                        >
                          <span className="text-primary-400 mt-1">💬</span>
                          <span className="italic">"{prompt}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Default Tools */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Included capabilities:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {template.defaultTools.slice(0, 6).map(toolId => (
                        <span 
                          key={toolId}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border"
                        >
                          {toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                      {template.defaultTools.length > 6 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-dashed">
                          +{template.defaultTools.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                >
                  <CheckIcon className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Custom Template Option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: filteredTemplates.length * 0.1 }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <CogIcon className="w-6 h-6 text-gray-400" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Start from Scratch
        </h4>
        <p className="text-gray-600 mb-4">
          Build a completely custom agent with your own tools and configuration.
        </p>
        <button 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          onClick={() => handleTemplateSelect('custom')}
        >
          Choose Custom Template →
        </button>
      </motion.div>

      {config.templateId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-green-600 font-medium">
            ✓ Template selected: {AGENT_TEMPLATES.find(t => t.id === config.templateId)?.name || 'Custom'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
