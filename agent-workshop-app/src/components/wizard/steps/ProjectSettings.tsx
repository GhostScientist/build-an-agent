'use client'

import { motion } from 'framer-motion'
import {
  FolderIcon,
  UserIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { AgentConfig } from '@/types/agent'

interface ProjectSettingsProps {
  config: Partial<AgentConfig>
  updateConfig: (updates: Partial<AgentConfig>) => void
  onNext: () => void
}

export function ProjectSettings({ config, updateConfig, onNext }: ProjectSettingsProps) {
  const generateProjectName = () => {
    if (config.name) {
      const sanitized = config.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^[^a-z]/, 'agent-')
      updateConfig({ projectName: sanitized })
    }
  }

  const generatePackageName = () => {
    if (config.projectName) {
      updateConfig({ packageName: config.projectName })
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Project Configuration
        </h3>
        <p className="text-gray-600">
          Configure the basic settings for your generated agent project.
        </p>
      </div>

      <div className="space-y-6">
        {/* Agent Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <UserIcon className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Agent Identity</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={config.name || ''}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="My Development Assistant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Display name for your agent
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <input
                type="text"
                value={config.version || '1.0.0'}
                onChange={(e) => updateConfig({ version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={config.description || ''}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="A brief description of what your agent does..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
            />
          </div>
        </motion.div>

        {/* Project Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FolderIcon className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Project Details</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={config.projectName || ''}
                  onChange={(e) => updateConfig({ projectName: e.target.value })}
                  placeholder="my-agent"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={generateProjectName}
                  disabled={!config.name}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Auto
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lowercase, letters, numbers, hyphens only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Name
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={config.packageName || ''}
                  onChange={(e) => updateConfig({ packageName: e.target.value })}
                  placeholder="my-agent"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={generatePackageName}
                  disabled={!config.projectName}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sync
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <input
              type="text"
              value={config.author || ''}
              onChange={(e) => updateConfig({ author: e.target.value })}
              placeholder="Your Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </motion.div>

        {/* License */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <DocumentTextIcon className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">License</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License
            </label>
            <select
              value={config.license || 'MIT'}
              onChange={(e) => updateConfig({ license: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache 2.0</option>
              <option value="GPL-3.0">GPL 3.0</option>
              <option value="BSD-3-Clause">BSD 3-Clause</option>
              <option value="ISC">ISC</option>
              <option value="Unlicense">Unlicense</option>
            </select>
          </div>
        </motion.div>

        {/* Validation Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h5 className="font-medium text-green-900">Ready to Generate</h5>
              <div className="text-sm text-green-700 mt-1 space-y-1">
                <p>✓ Agent Name: {config.name || 'Not set'}</p>
                <p>✓ Project Name: {config.projectName || 'Not set'}</p>
                <p>✓ Author: {config.author || 'Not set'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}