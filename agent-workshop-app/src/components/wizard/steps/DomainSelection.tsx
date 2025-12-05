'use client'

import { motion } from 'framer-motion'
import {
  CodeBracketIcon,
  CogIcon,
  RocketLaunchIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { AgentConfig, AgentDomain } from '@/types/agent'

interface DomainSelectionProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

const domains = [
  {
    id: 'development' as AgentDomain,
    name: 'Development',
    description: 'Code analysis, file operations, build tools, debugging, and development workflows.',
    icon: CodeBracketIcon,
    gradient: 'from-blue-500 to-cyan-600',
    examples: [
      'React/Next.js development assistant',
      'Mobile app development (iOS/Android)',
      'DevOps automation and CI/CD',
      'Code review and quality analysis'
    ],
    tools: ['File Operations', 'Git Integration', 'Build Tools', 'Code Analysis', 'Testing Frameworks']
  },
  {
    id: 'knowledge' as AgentDomain,
    name: 'Knowledge & Research',
    description: 'Evidence-backed research, literature review, and scientific reporting.',
    icon: ChartBarIcon,
    gradient: 'from-amber-500 to-orange-600',
    examples: [
      'Systematic literature reviews with citations',
      'Scientific notebook and experiment logging',
      'Competitive intelligence and market briefs',
      'Policy/Grant analysis with source tracking'
    ],
    tools: ['Web Fetch/Search', 'Document Parsing', 'Citation Tracking', 'API Integrations', 'Reporting']
  },
  {
    id: 'business' as AgentDomain,
    name: 'Business Process',
    description: 'Document analysis, workflow automation, reporting, and business intelligence.',
    icon: CogIcon,
    gradient: 'from-green-500 to-emerald-600', 
    examples: [
      'Document processing and analysis',
      'Workflow automation and optimization', 
      'Business reporting and analytics',
      'Customer support and knowledge base'
    ],
    tools: ['Document AI', 'Process Automation', 'Data Analysis', 'API Integration', 'Reporting']
  },
  {
    id: 'creative' as AgentDomain,
    name: 'Creative & Content',
    description: 'Content creation, copywriting, social media, marketing, and creative projects.',
    icon: RocketLaunchIcon,
    gradient: 'from-purple-500 to-pink-600',
    examples: [
      'Blog and article writing',
      'Social media content creation',
      'Marketing copy and campaigns', 
      'SEO optimization and strategy'
    ],
    tools: ['Content Generation', 'SEO Tools', 'Social Media', 'Image Analysis', 'Web Research']
  },
  {
    id: 'data' as AgentDomain,
    name: 'Data & Analytics',
    description: 'Data analysis, visualization, machine learning, and scientific computing.',
    icon: ChartBarIcon,
    gradient: 'from-orange-500 to-red-600',
    examples: [
      'Data analysis and visualization',
      'SQL query generation and optimization',
      'Machine learning model development',
      'Statistical analysis and reporting'
    ],
    tools: ['Data Processing', 'SQL Queries', 'Visualization', 'ML Tools', 'Statistical Analysis']
  }
]

export function DomainSelection({ config, updateConfig, onNext }: DomainSelectionProps) {
  const handleDomainSelect = (domain: AgentDomain) => {
    updateConfig({ domain })
    // Note: Removed auto-advance - users can click Next button when ready
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What type of agent do you want to build?
        </h3>
        <p className="text-gray-600">
          Choose a domain that best matches your intended use case. This will determine the available templates and tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {domains.map((domain, index) => (
          <motion.div
            key={domain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg group ${
              config.domain === domain.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleDomainSelect(domain.id)}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${domain.gradient} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <domain.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {domain.name}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {domain.description}
                </p>

                {/* Examples */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Examples:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {domain.examples.slice(0, 3).map((example, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Tools */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Capabilities:</h5>
                  <div className="flex flex-wrap gap-1">
                    {domain.tools.map(tool => (
                      <span 
                        key={tool}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {config.domain === domain.id && (
                <div className="text-primary-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {config.domain && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-green-600 font-medium">
            ✓ {domains.find(d => d.id === config.domain)?.name} selected
          </p>
        </motion.div>
      )}
    </div>
  )
}
