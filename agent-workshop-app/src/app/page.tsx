'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RocketLaunchIcon,
  CogIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  ChartBarIcon
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
              <h1 className="text-lg font-semibold tracking-tight">Build-An-Agent Workshop</h1>
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
              Idea to{' '}
              <span className="underline decoration-4 underline-offset-8 decoration-primary/30">
                AI Agent CLI
              </span>
              {' '}in Minutes
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto"
            >
              For researchers, developers, and anyone who wants a specialized AI assistant.
              Generate your own complete TypeScript CLI project <br /> <span className="font-semibold text-foreground">Free!</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-wrap gap-3 justify-center mb-8 max-w-3xl mx-auto"
            >
              <div className="badge-outline px-4 py-2 text-sm font-medium bg-orange-500/5 border-orange-500/20 text-orange-700 dark:text-orange-400 flex items-center gap-2">
                <img src="/Anthropic icon - Slate.svg" alt="Anthropic" className="w-4 h-4" />
                Anthropic Claude Agents SDK
              </div>
              <div className="badge-outline px-4 py-2 text-sm font-medium bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <img src="/OpenAI-black-monoblossom.svg" alt="OpenAI" className="w-4 h-4" />
                OpenAI Agents SDK
              </div>
            </motion.div>
            
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
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 relative"
            >
              <div className="bg-muted rounded-lg border p-6 font-mono text-xs md:text-sm text-left max-w-3xl mx-auto">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground ml-2">Generated Agent CLI</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-green-500">$</span>
                    <span className="text-foreground"> my-agent</span>
                  </div>
                  <div className="text-muted-foreground">
                    🤖 Code Review Agent
                  </div>
                  <div className="text-muted-foreground">
                    Automated code quality and security analysis
                  </div>
                  <div className="mt-4">
                    <span className="text-blue-400">my-agent&gt;</span>
                    <span className="text-foreground"> Review the auth module for security issues</span>
                  </div>
                  <div className="text-muted-foreground mt-2">
                    <span className="animate-pulse">▋</span> Analyzing authentication implementation...
                  </div>
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
              Built on Official SDKs
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              True integration with Claude Agent SDK and OpenAI Agents API—complete with
              MCP tools, streaming, session management, and built-in security.
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
              Ready to Build Your Agent?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose your SDK, pick a template, select tools—preview the generated code and download your working CLI in under a minute.
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="btn-default px-8 py-3 text-base font-semibold inline-flex items-center space-x-2"
            >
              <span>Start Building</span>
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
              <h4 className="text-lg font-semibold">Build-An-Agent Workshop</h4>
            </div>
            <p className="text-primary-foreground/80 mb-6">
              Free, open-source tool for generating AI agent CLIs
            </p>
            <p className="text-primary-foreground/60 text-sm">
              © 2024 Build-An-Agent Workshop. Made with ❤️ for the AI community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'SDK-Native Implementation',
    description: 'Built on Claude Agent SDK and OpenAI Agents API. Get proper MCP tool integration, session management, streaming, and automatic context handling—not a wrapper, but true SDK integration.',
    icon: CodeBracketIcon,
  },
  {
    title: 'Production-Ready Security',
    description: 'Claude Code-style permission system with interactive prompts for file operations, command execution, and network requests. Users approve actions before they execute.',
    icon: CogIcon,
  },
  {
    title: 'Instant Customization',
    description: 'Download complete TypeScript source code. Modify system prompts, add custom tools, adjust behaviors, or extend with MCP servers. It\'s your codebase from day one.',
    icon: RocketLaunchIcon,
  },
]

const agentTemplates = [
  {
    name: 'Research Ops Agent',
    description: 'Evidence-backed literature reviews, source tracking, and analyst-ready briefs.',
    tools: ['Web Fetch/Search', 'Document Parsing', 'Citation Tracking', 'Reporting'],
    icon: ChartBarIcon,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    name: 'Legacy Code Modernization',
    description: 'Analyze legacy codebases, identify technical debt, and create modernization strategies.',
    tools: ['Code Analysis', 'Migration Planning', 'Security Audit', 'Architecture Review'],
    icon: CodeBracketIcon,
    gradient: 'bg-gradient-to-br from-indigo-500 to-blue-600',
  },
  {
    name: 'Document Processing',
    description: 'Extract, analyze, and transform business documents at scale with automation.',
    tools: ['PDF Extraction', 'Classification', 'Data Validation', 'Reporting'],
    icon: CogIcon,
    gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
  },
  {
    name: 'Social Media Manager',
    description: 'Create, plan, and optimize social media content across all major platforms.',
    tools: ['Content Creation', 'Trend Analysis', 'Scheduling', 'Multi-platform'],
    icon: RocketLaunchIcon,
    gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
  },
]
