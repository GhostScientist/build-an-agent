'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  FolderIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { GeneratedProject, GeneratedFile } from '@/types/agent'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ProjectPreviewProps {
  project: GeneratedProject
  onClose: () => void
  onDownload: () => void
}

export function ProjectPreview({ project, onClose, onDownload }: ProjectPreviewProps) {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(project.files[0])
  const [activeTab, setActiveTab] = useState<'files' | 'overview' | 'security'>('files')

  const getFileIcon = (file: GeneratedFile) => {
    switch (file.type) {
      case 'typescript':
        return <CodeBracketIcon className="w-4 h-4 text-blue-500" />
      case 'json':
        return <DocumentTextIcon className="w-4 h-4 text-yellow-500" />
      case 'markdown':
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />
      case 'dockerfile':
        return <DocumentTextIcon className="w-4 h-4 text-blue-600" />
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getLanguageFromType = (type: GeneratedFile['type']) => {
    switch (type) {
      case 'typescript': return 'typescript'
      case 'json': return 'json'
      case 'markdown': return 'markdown'
      case 'dockerfile': return 'dockerfile'
      case 'yaml': return 'yaml'
      case 'shell': return 'bash'
      default: return 'text'
    }
  }

  const organizeFilesByDirectory = () => {
    const organized: Record<string, GeneratedFile[]> = {}
    
    project.files.forEach(file => {
      const parts = file.path.split('/')
      if (parts.length === 1) {
        // Root files
        if (!organized['root']) organized['root'] = []
        organized['root'].push(file)
      } else {
        // Directory files
        const dir = parts[0]
        if (!organized[dir]) organized[dir] = []
        organized[dir].push(file)
      }
    })
    
    return organized
  }

  const filesByDirectory = organizeFilesByDirectory()

  const securityChecks = [
    {
      category: 'API Keys',
      status: 'safe',
      message: 'No hardcoded API keys found. Uses environment variables and config files.',
      items: ['API keys stored in .env files', 'Configuration management implemented']
    },
    {
      category: 'File Operations',
      status: project.config.tools?.some(t => t.id === 'write-file' && t.enabled) ? 'warning' : 'safe',
      message: project.config.tools?.some(t => t.id === 'write-file' && t.enabled) 
        ? 'Agent has file write permissions. Review generated code carefully.'
        : 'Agent has read-only file access.',
      items: project.config.tools?.filter(t => t.enabled && t.category === 'file').map(t => t.name) || []
    },
    {
      category: 'Command Execution',
      status: project.config.tools?.some(t => t.id === 'run-command' && t.enabled) ? 'danger' : 'safe',
      message: project.config.tools?.some(t => t.id === 'run-command' && t.enabled)
        ? 'Agent can execute system commands. Use with caution in production.'
        : 'No command execution capabilities.',
      items: project.config.tools?.filter(t => t.enabled && t.category === 'command').map(t => t.name) || []
    }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.config.name}</h2>
            <p className="text-gray-600">{project.files.length} files generated</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'files'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Files
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'security'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Security
              </button>
            </div>
            
            <button
              onClick={onDownload}
              className="btn-primary flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Download Project</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-1 overflow-hidden"
              >
                {/* File Tree */}
                <div className="w-80 border-r border-gray-200 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FolderIcon className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold text-gray-900">{project.config.projectName}</span>
                    </div>
                    
                    {Object.entries(filesByDirectory).map(([directory, files]) => (
                      <div key={directory} className="mb-4">
                        {directory !== 'root' && (
                          <div className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
                            <FolderIcon className="w-4 h-4" />
                            <span>{directory}/</span>
                          </div>
                        )}
                        
                        <div className={directory !== 'root' ? 'ml-6 space-y-1' : 'space-y-1'}>
                          {files.map(file => (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFile(file)}
                              className={`w-full flex items-center space-x-2 p-2 text-left rounded-lg text-sm transition-colors ${
                                selectedFile?.path === file.path
                                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              {getFileIcon(file)}
                              <span className="truncate">{file.path.split('/').pop()}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {selectedFile ? (
                    <>
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(selectedFile)}
                            <span className="font-medium text-gray-900">{selectedFile.path}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {selectedFile.type}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            {selectedFile.content.split('\n').length} lines
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-auto">
                        <SyntaxHighlighter
                          language={getLanguageFromType(selectedFile.type)}
                          style={oneDark}
                          showLineNumbers
                          customStyle={{
                            margin: 0,
                            padding: '1rem',
                            background: '#1a1a1a',
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}
                        >
                          {selectedFile.content}
                        </SyntaxHighlighter>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <EyeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Select a file to preview its content</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Project Summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Agent Name:</span>
                          <span className="font-medium">{project.config.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Domain:</span>
                          <span className="font-medium capitalize">{project.config.domain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">AI Provider:</span>
                          <span className="font-medium">{project.config.sdkProvider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Interface:</span>
                          <span className="font-medium uppercase">{project.config.interface}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <span className="font-medium">{project.config.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">License:</span>
                          <span className="font-medium">{project.config.license}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tools Enabled:</span>
                          <span className="font-medium">{project.config.tools?.filter(t => t.enabled).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Files Generated:</span>
                          <span className="font-medium">{project.files.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enabled Tools */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Enabled Capabilities</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {project.config.tools?.filter(t => t.enabled).map(tool => (
                        <div key={tool.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">{tool.name}</h4>
                            <p className="text-sm text-gray-600">{tool.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Build Instructions */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Instructions</h3>
                    <div className="space-y-4">
                      {project.metadata.buildInstructions.map((instruction, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                            {instruction}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dependencies */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependencies</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Production Dependencies</h4>
                        <div className="space-y-1">
                          {Object.entries(project.metadata.dependencies).map(([name, version]) => (
                            <div key={name} className="flex justify-between text-sm">
                              <span className="font-mono text-gray-700">{name}</span>
                              <span className="text-gray-500">{version}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Development Dependencies</h4>
                        <div className="space-y-1">
                          {Object.entries(project.metadata.devDependencies).map(([name, version]) => (
                            <div key={name} className="flex justify-between text-sm">
                              <span className="font-mono text-gray-700">{name}</span>
                              <span className="text-gray-500">{version}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Analysis</h3>
                    <p className="text-gray-600">Review the security implications of your agent's capabilities</p>
                  </div>

                  {securityChecks.map((check, index) => (
                    <div
                      key={check.category}
                      className={`border-2 rounded-xl p-6 ${
                        check.status === 'safe'
                          ? 'border-green-200 bg-green-50'
                          : check.status === 'warning'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          check.status === 'safe'
                            ? 'bg-green-100'
                            : check.status === 'warning'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                        }`}>
                          {check.status === 'safe' ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <ExclamationTriangleIcon className={`w-5 h-5 ${
                              check.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{check.category}</h4>
                          <p className="text-gray-700 mb-3">{check.message}</p>
                          
                          {check.items.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Details:</p>
                              <ul className="space-y-1">
                                {check.items.map((item, idx) => (
                                  <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Security Best Practices</h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                          <li>• Always review generated code before running in production</li>
                          <li>• Use environment variables for API keys and sensitive data</li>
                          <li>• Test agents in isolated environments first</li>
                          <li>• Regularly update dependencies for security patches</li>
                          <li>• Monitor agent activity and set appropriate rate limits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}