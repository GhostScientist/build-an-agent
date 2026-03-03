'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { AgentConfig } from '@/types/agent'
import { AGENT_TEMPLATES } from '@/types/agent'
import { generateAgentProject } from '@/lib/generator'
import { ProjectPreview } from '@/components/preview/ProjectPreview'
import toast from 'react-hot-toast'
import { saveAs } from 'file-saver'

interface PreviewAndGenerateProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

export function PreviewAndGenerate({ config, updateConfig, onNext }: PreviewAndGenerateProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([])

  const selectedTemplate = AGENT_TEMPLATES.find(t => t.id === config.templateId)
  const enabledTools = config.tools?.filter(t => t.enabled) || []

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      toast.loading('Generating your agent project...', { id: 'generate' })

      // Validate configuration - HuggingFace has fewer requirements
      const requiredFields = config.sdkProvider === 'huggingface'
        ? ['name', 'projectName', 'sdkProvider', 'model']
        : ['name', 'projectName', 'author', 'domain', 'sdkProvider']
      const missingFields = requiredFields.filter(field => !config[field as keyof AgentConfig])

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Generate project if not already generated
      let result
      if (generatedFiles.length === 0) {
        result = await generateAgentProject(config as AgentConfig)
        setGeneratedFiles(result.files)
      } else {
        result = { files: generatedFiles }
      }
      
      toast.success('Agent project generated successfully!', { id: 'generate' })
      
      // Download the generated project
      await downloadProject(result)
      
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate project', { id: 'generate' })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadProject = async (project: any) => {
    try {
      const JSZip = (await import('jszip')).default
      
      const zip = new JSZip()
      
      // Add all generated files to the zip
      project.files.forEach((file: any) => {
        zip.file(file.path, file.content)
      })
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' })
      
      // Download the zip file
      const filename = `${config.projectName || 'agent-project'}.zip`
      saveAs(content, filename)
      
      toast.success(`Project downloaded as ${filename}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download project')
    }
  }

  const previewCode = async () => {
    if (!showPreview && generatedFiles.length === 0) {
      try {
        toast.loading('Generating preview...', { id: 'preview' })

        // Validate configuration - HuggingFace has fewer requirements
        const requiredFields = config.sdkProvider === 'huggingface'
          ? ['name', 'projectName', 'sdkProvider', 'model']
          : ['name', 'projectName', 'author', 'domain', 'sdkProvider']
        const missingFields = requiredFields.filter(field => !config[field as keyof AgentConfig])

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
        }
        
        // Generate project for preview
        const result = await generateAgentProject(config as AgentConfig)
        setGeneratedFiles(result.files)
        
        toast.success('Preview generated!', { id: 'preview' })
      } catch (error) {
        console.error('Preview error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to generate preview', { id: 'preview' })
        return
      }
    }
    
    setShowPreview(!showPreview)
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Preview & Generate Agent
        </h3>
        <p className="text-gray-600">
          Review your configuration and generate your specialized AI agent project.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              <h4 className="font-semibold text-gray-900">Agent Overview</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{config.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Domain:</span>
                <span className="font-medium text-gray-900 capitalize">{config.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Template:</span>
                <span className="font-medium text-gray-900">{selectedTemplate?.name || 'Custom'}</span>
              </div>
            </div>
          </motion.div>

          {/* AI Provider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <CpuChipIcon className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900">AI Configuration</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium text-gray-900 capitalize">{config.sdkProvider?.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-gray-900">{config.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Tokens:</span>
                <span className="font-medium text-gray-900">{config.maxTokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium text-gray-900">{config.temperature}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Tools & Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <WrenchScrewdriverIcon className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-gray-900">Capabilities</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Permission Level:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  config.permissions === 'restrictive' ? 'bg-red-100 text-red-700' :
                  config.permissions === 'balanced' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {config.permissions ? config.permissions.charAt(0).toUpperCase() + config.permissions.slice(1) : 'Balanced'}
                </span>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {enabledTools.map(tool => (
                  <div key={tool.id} className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FolderIcon className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-gray-900">Project Details</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Project Name:</span>
                <span className="font-medium text-gray-900 font-mono text-sm">{config.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium text-gray-900">{config.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Author:</span>
                <span className="font-medium text-gray-900">{config.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">License:</span>
                <span className="font-medium text-gray-900">{config.license}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Generation Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary-50 to-agent-50 border border-primary-200 rounded-xl p-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-agent-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            {isGenerating ? (
              <ClockIcon className="w-8 h-8 text-white animate-spin" />
            ) : (
              <DocumentArrowDownIcon className="w-8 h-8 text-white" />
            )}
          </div>
          
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            {isGenerating ? 'Generating Your Agent...' : 'Ready to Generate'}
          </h4>
          
          <p className="text-gray-600 mb-6">
            {isGenerating 
              ? 'Creating your specialized AI agent with custom tools and configuration...'
              : 'Your agent will be generated as a complete, ready-to-run project with documentation and setup instructions.'
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={previewCode}
              disabled={isGenerating}
              className="btn-secondary flex items-center space-x-2"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Preview Code</span>
            </button>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-agent flex items-center space-x-2 px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <ClockIcon className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span>Generate & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* What You'll Get */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h4 className="font-semibold text-gray-900 mb-4">What you'll get:</h4>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Complete CLI application with TypeScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>AI SDK integration and streaming support</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Custom tools and capabilities</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Configuration management system</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Package.json with all dependencies</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>README with setup instructions</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Deployment configurations</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Example usage and documentation</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project Preview Modal */}
      {showPreview && generatedFiles.length > 0 && (
        <ProjectPreview
          project={{
            files: generatedFiles,
            config: config as AgentConfig,
            metadata: {
              generatedAt: new Date(),
              templateVersion: '1.0.0',
              agentWorkshopVersion: '1.0.0',
              dependencies: {},
              devDependencies: {},
              scripts: {},
              buildInstructions: [],
              deploymentOptions: []
            }
          }}
          onClose={() => setShowPreview(false)}
          onDownload={() => downloadProject({ files: generatedFiles })}
        />
      )}
    </div>
  )
}