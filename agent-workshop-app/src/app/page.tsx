'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  RocketLaunchIcon, 
  CogIcon, 
  CodeBracketIcon,
  BoltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { AgentBuilder } from '@/components/wizard/AgentBuilder'

export default function HomePage() {
  const [showBuilder, setShowBuilder] = useState(false)

  if (showBuilder) {
    return <AgentBuilder onBack={() => setShowBuilder(false)} />
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                <BoltIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">Agent Workshop</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </a>
              <button 
                onClick={() => setShowBuilder(true)}
                className="btn-default"
              >
                Build Agent
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 py-32">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-foreground"
            >
              From{' '}
              <span className="underline decoration-4 underline-offset-8 decoration-primary/30">
                Idea to Agent
              </span>
              <br />
              in Minutes
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Transform your ideas into powerful AI agents. Choose your domain, configure tools, 
              and download a complete agent project ready for deployment.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <button 
                onClick={() => setShowBuilder(true)}
                className="btn-default px-8 py-3 text-base font-medium"
              >
                Start Building
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
              
              <a 
                href="#features" 
                className="btn-ghost px-8 py-3 text-base"
              >
                View Features
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10"></div>
              <div className="bg-muted rounded-lg border p-8 font-mono text-sm text-left max-w-2xl mx-auto overflow-hidden">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground ml-2">terminal</span>
                </div>
                <div className="text-muted-foreground">
                  <span className="text-primary">$ </span>
                  <span className="animate-pulse">npm install && npm start</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight mb-4">
              Build Professional AI Agents
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No coding required. Choose from expert templates, customize with powerful tools, 
              and deploy anywhere.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight mb-4">
              Expert Agent Templates
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with battle-tested templates designed for specific domains and use cases.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {agentTemplates.map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6 hover:shadow-md transition-all duration-200 cursor-pointer group border-l-4 border-l-primary/20 hover:border-l-primary"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                  <template.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.tools.slice(0, 3).map(tool => (
                    <span 
                      key={tool} 
                      className="badge-outline text-xs"
                    >
                      {tool}
                    </span>
                  ))}
                  {template.tools.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{template.tools.length - 3} more
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Build Your AI Agent?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers and businesses creating specialized AI assistants.
            </p>
            <button 
              onClick={() => setShowBuilder(true)}
              className="btn-default px-8 py-3 text-base font-semibold inline-flex items-center space-x-2"
            >
              <span>Start Building Now</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-primary-foreground text-primary rounded-sm flex items-center justify-center">
                <BoltIcon className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-semibold">Agent Workshop</h4>
            </div>
            <p className="text-primary-foreground/80 mb-6">
              Democratizing AI agent development for everyone
            </p>
            <p className="text-primary-foreground/60 text-sm">
              © 2024 Agent Workshop. Made with ❤️ for the AI community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Expert Templates',
    description: 'Choose from professionally designed agent templates for development, business, and creative use cases.',
    icon: CodeBracketIcon,
  },
  {
    title: 'Multi-SDK Support',
    description: 'Support for Claude, OpenAI, and other popular AI providers. Switch between them seamlessly.',
    icon: CogIcon,
  },
  {
    title: 'One-Click Deploy',
    description: 'Download complete projects or deploy directly to your favorite hosting platform.',
    icon: RocketLaunchIcon,
  },
]

const agentTemplates = [
  {
    name: 'Development Agent',
    description: 'Full-stack development assistant with file operations, build tools, and code analysis.',
    tools: ['File Ops', 'Git', 'Build Tools', 'Code Analysis'],
    icon: CodeBracketIcon,
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  {
    name: 'Business Agent', 
    description: 'Document analysis, workflow automation, and business process optimization.',
    tools: ['Document AI', 'Workflow', 'Analytics', 'Integration'],
    icon: CogIcon,
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
  {
    name: 'Creative Agent',
    description: 'Content creation, marketing copy, social media, and creative writing assistance.',
    tools: ['Content Gen', 'SEO', 'Social Media', 'Writing'],
    icon: RocketLaunchIcon,
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
  },
]