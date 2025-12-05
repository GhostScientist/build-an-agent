'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { AgentConfig, WizardStep } from '@/types/agent'
import { DomainSelection } from './steps/DomainSelection'
import { TemplateSelection } from './steps/TemplateSelection'
import { SDKConfiguration } from './steps/SDKConfiguration'
import { ToolConfiguration } from './steps/ToolConfiguration'
import { MCPConfiguration } from './steps/MCPConfiguration'
import { ProjectSettings } from './steps/ProjectSettings'
import { PreviewAndGenerate } from './steps/PreviewAndGenerate'
import { useAgentStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface AgentBuilderProps {
  onBack: () => void
}

export function AgentBuilder({ onBack }: AgentBuilderProps) {
  const { config, updateConfig, resetConfig } = useAgentStore()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: WizardStep[] = [
    {
      id: 'domain',
      title: 'Choose Domain',
      description: 'Select your agent\'s area of expertise',
      component: DomainSelection,
      isComplete: (config) => !!config.domain,
      validation: (config) => config.domain ? [] : ['Please select a domain']
    },
    {
      id: 'template',  
      title: 'Select Template',
      description: 'Pick a starting template for your agent',
      component: TemplateSelection,
      isComplete: (config) => !!config.templateId,
      validation: (config) => config.templateId ? [] : ['Please select a template']
    },
    {
      id: 'sdk',
      title: 'Configure AI Provider', 
      description: 'Choose your AI provider and model',
      component: SDKConfiguration,
      isComplete: (config) => !!config.sdkProvider,
      validation: (config) => {
        const errors = []
        if (!config.sdkProvider) errors.push('Please select an AI provider')
        return errors
      }
    },
    {
      id: 'tools',
      title: 'Configure Tools',
      description: 'Select capabilities for your agent',
      component: ToolConfiguration,
      isComplete: (config) => !!(config.tools && config.tools.some(t => t.enabled)),
      validation: (config) => {
        if (!config.tools?.some(t => t.enabled)) {
          return ['Please enable at least one tool']
        }
        return []
      }
    },
    {
      id: 'mcp',
      title: 'MCP Servers',
      description: 'Connect to Model Context Protocol servers (optional)',
      component: MCPConfiguration,
      isComplete: () => true, // Optional step, always complete
      validation: () => [] // No validation required
    },
    {
      id: 'project',
      title: 'Project Settings',
      description: 'Configure your project details',
      component: ProjectSettings,
      isComplete: (config) => !!(config.name && config.projectName && config.author),
      validation: (config) => {
        const errors = []
        if (!config.name) errors.push('Agent name is required')
        if (!config.projectName) errors.push('Project name is required')
        if (!config.author) errors.push('Author name is required')
        return errors
      }
    },
    {
      id: 'preview',
      title: 'Preview & Generate',
      description: 'Review your configuration and generate the project',
      component: PreviewAndGenerate,
      isComplete: () => true,
      validation: () => []
    }
  ]

  const currentStepData = steps[currentStep]
  const CurrentStepComponent = currentStepData.component

  const handleNext = useCallback(() => {
    const errors = currentStepData.validation?.(config) || []
    
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, currentStepData, config])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleStepClick = useCallback((stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex)
    }
  }, [currentStep])

  const handleReset = useCallback(() => {
    resetConfig()
    setCurrentStep(0)
    toast.success('Configuration reset')
  }, [resetConfig])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="btn-ghost p-2 -ml-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-base font-semibold">Agent Builder</h1>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}: {currentStepData.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset
              </button>
              {config.name && (
                <div className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded">
                  {config.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with Steps */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-base font-semibold mb-4">Progress</h3>
              
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isCompleted = step.isComplete(config)
                  const isCurrent = index === currentStep
                  const isAccessible = index <= currentStep
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      disabled={!isAccessible}
                      className={`w-full text-left p-3 rounded-md border transition-all ${
                        isCurrent 
                          ? 'border-primary bg-accent' 
                          : isCompleted
                          ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                          : isAccessible
                          ? 'border-border hover:bg-accent'
                          : 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckIcon className="w-3 h-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-foreground' : 'text-foreground'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-8"
              >
                <div className="mb-8">
                  <h2 className="text-xl font-semibold tracking-tight mb-2">
                    {currentStepData.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentStepData.description}
                  </p>
                </div>

                <CurrentStepComponent 
                  config={config}
                  updateConfig={updateConfig}
                  onNext={handleNext}
                />

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`btn-ghost flex items-center space-x-2 ${
                      currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono">
                    <span>{currentStep + 1}</span>
                    <span>/</span>
                    <span>{steps.length}</span>
                  </div>

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="btn-default flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-20" />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}