'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RocketLaunchIcon,
  CogIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon,
  DocumentTextIcon,
  CommandLineIcon,
  CubeIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { AnimatePresence } from 'framer-motion'
import { AgentBuilder } from '@/components/wizard/AgentBuilder'

// Lever definitions for the 5 Claude Code control mechanisms
const LEVER_DEFINITIONS = [
  {
    id: 'memory',
    name: 'Memory',
    file: 'CLAUDE.md',
    analogy: 'Project context and coding standards',
    description: 'A markdown file at the root of your project that provides persistent context to Claude about your codebase, team standards, and project-specific information.',
    icon: DocumentTextIcon,
    gradient: 'from-blue-500 to-cyan-500',
    whenToUse: [
      'Document your project architecture and key decisions',
      'Set coding standards and style guidelines',
      'Define security policies and sensitive areas',
      'Provide context about third-party integrations'
    ],
    securityTieIn: 'Define which files/directories are off-limits',
    docsUrl: '/docs/features/levers/memory',
    example: `# Project Context
This is a Next.js 14 application using App Router.

## Coding Standards
- Use TypeScript strict mode
- Prefer async/await over callbacks
- All components should be server components unless they need interactivity`
  },
  {
    id: 'commands',
    name: 'Slash Commands',
    file: '.claude/commands/',
    analogy: 'Reusable task templates',
    description: 'Custom commands that expand into predefined prompts. Create shortcuts for common workflows like code review, testing, or documentation.',
    icon: CommandLineIcon,
    gradient: 'from-purple-500 to-pink-500',
    whenToUse: [
      'Create shortcuts for repeated tasks',
      'Standardize code review processes',
      'Define templated workflows',
      'Share best practices across team'
    ],
    securityTieIn: 'Encode security checks into standard workflows',
    docsUrl: '/docs/features/levers/slash-commands',
    example: `# /review command
Review $1 for:
1. Security vulnerabilities
2. Error handling
3. Test coverage
4. Code style compliance`
  },
  {
    id: 'skills',
    name: 'Skills',
    file: '.claude/skills/',
    analogy: 'Specialized expertise modules',
    description: 'Collections of instructions, tools, and references that give Claude deep expertise in specific domains or technologies.',
    icon: CubeIcon,
    gradient: 'from-green-500 to-emerald-500',
    whenToUse: [
      'Add domain expertise (e.g., React, SQL, AWS)',
      'Bundle related tools and instructions',
      'Share specialized knowledge across projects',
      'Create team-specific capabilities'
    ],
    securityTieIn: 'Limit tools available per skill context',
    docsUrl: '/docs/features/levers/skills',
    example: `name: react-expert
description: Deep expertise in React and Next.js patterns
instructions: |
  When working with React components, always:
  - Use functional components with hooks
  - Implement proper error boundaries
  - Follow the React Server Components pattern`
  },
  {
    id: 'subagents',
    name: 'Subagents',
    file: '.claude/agents/',
    analogy: 'Specialized worker processes',
    description: 'Independent agent instances that can be spawned for specific tasks with their own tools, models, and permissions.',
    icon: UserGroupIcon,
    gradient: 'from-orange-500 to-red-500',
    whenToUse: [
      'Delegate complex sub-tasks',
      'Use different models for different needs',
      'Isolate risky operations',
      'Parallelize independent work'
    ],
    securityTieIn: 'Run risky operations in isolated subagents',
    docsUrl: '/docs/features/levers/subagents',
    example: `name: code-reviewer
description: Specialized code review agent
model: haiku
tools:
  - read-file
  - search-files
permissions: restrictive`
  },
  {
    id: 'hooks',
    name: 'Hooks',
    file: '.claude/settings.json',
    analogy: 'Event-driven automation',
    description: 'Shell commands that run automatically in response to agent events like tool calls, allowing for automatic formatting, linting, or validation.',
    icon: BoltIcon,
    gradient: 'from-yellow-500 to-amber-500',
    whenToUse: [
      'Auto-format code after writes',
      'Run linters on changed files',
      'Execute tests after modifications',
      'Block operations that violate policies'
    ],
    securityTieIn: 'Block commits containing secrets',
    docsUrl: '/docs/features/levers/hooks',
    example: `{
  "hooks": {
    "PostToolUse": [{
      "name": "prettier-on-write",
      "matcher": "Write",
      "command": "npx prettier --write $CLAUDE_FILE_PATH"
    }]
  }
}`
  }
]

export default function HomePage() {
  const [showBuilder, setShowBuilder] = useState(false)
  const [expandedHeuristic, setExpandedHeuristic] = useState<string | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [selectedLever, setSelectedLever] = useState<string | null>(null)

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
              <a href="#why" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Why
              </a>
              <a href="#levers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Levers
              </a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </a>
              <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
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
              An educational platform and creation tool for building production-ready AI agent CLIs.
              Learn what goes into agentic systems, then ship with confidence. <br />
              <span className="font-semibold text-foreground">Free and open-source.</span>
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
              className="flex flex-col gap-4 items-center"
            >
              <div className="text-sm text-muted-foreground mb-2">Two ways to build:</div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => setShowBuilder(true)}
                  className="btn-default px-8 py-3 text-base font-medium"
                >
                  <span className="mr-2">🌐</span>
                  Web Builder
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>

                <a
                  href="https://github.com/GhostScientist/build-an-agent/tree/main/create-agent-app#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost px-8 py-3 text-base"
                >
                  <span className="mr-2">⌨️</span>
                  CLI: npx create-agent-app
                </a>
              </div>
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
                  <span className="text-muted-foreground ml-2">Research Agent CLI with Workflows</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-green-500">$</span>
                    <span className="text-foreground"> researcher-agent</span>
                  </div>
                  <div className="text-muted-foreground">
                    🔬 Research Operations Agent
                  </div>
                  <div className="text-muted-foreground">
                    Evidence-backed research with systematic literature reviews
                  </div>
                  <div className="mt-4">
                    <span className="text-blue-400">researcher&gt;</span>
                    <span className="text-foreground"> /literature-review --sources ./papers --limit 15</span>
                  </div>
                  <div className="text-muted-foreground mt-2">
                    <span className="text-green-500">✓</span> Step 1/6: Found 23 documents in ./papers
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-green-500">✓</span> Step 2/6: Extracted 15 key claims with citations
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-yellow-500">⋯</span> Step 3/6: Identifying research gaps...
                  </div>
                  <div className="text-muted-foreground mt-2">
                    <span className="animate-pulse">▋</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section id="why" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold tracking-tight mb-4"
            >
              Why Build-An-Agent?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              An exploration tool for understanding agentic workflows—not a magic solution.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Card: Not a Silver Bullet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card p-8"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-amber-500 mb-4" />
              <h4 className="text-xl font-semibold mb-4">Not a Silver Bullet</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Agents can make mistakes and hallucinate—always verify outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Complex tasks still need human oversight and judgment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>This tool helps you learn and experiment, not replace expertise</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Start small, iterate, and understand what works for your use case</span>
                </li>
              </ul>
            </motion.div>

            {/* Card: Security First */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card p-8"
            >
              <ShieldCheckIcon className="w-8 h-8 text-green-500 mb-4" />
              <h4 className="text-xl font-semibold mb-4">Security-First Mindset</h4>
              <div className="space-y-3">
                {securityHeuristics.map((heuristic) => (
                  <div key={heuristic.id} className="border-b border-border/50 pb-3 last:border-0">
                    <button
                      onClick={() => setExpandedHeuristic(
                        expandedHeuristic === heuristic.id ? null : heuristic.id
                      )}
                      className="w-full text-left flex items-center justify-between group"
                    >
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {heuristic.brief}
                      </span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedHeuristic === heuristic.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedHeuristic === heuristic.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-green-500/30">
                            {heuristic.expanded}
                          </p>
                          {heuristic.link && (
                            <a
                              href={heuristic.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-2 inline-block pl-4"
                            >
                              {heuristic.link.label} →
                            </a>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-background rounded-lg border p-6 max-w-4xl mx-auto text-center"
          >
            <p className="text-muted-foreground">
              Built for{' '}
              <span className="font-semibold text-foreground">developers</span>,{' '}
              <span className="font-semibold text-foreground">researchers</span>,{' '}
              <span className="font-semibold text-foreground">domain specialists</span>, and{' '}
              <span className="font-semibold text-foreground">curious minds</span>{' '}
              exploring what&apos;s possible with agentic workflows.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight mb-4">
              Enterprise Workflows Meet AI Intelligence
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generated agents include sophisticated slash command workflows for multi-step operations.
              Built on Claude Agent SDK and OpenAI Agents API with MCP tools, streaming, and production-grade security.
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

      {/* See This In Practice Section */}
      <section id="practice" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold tracking-tight mb-4"
            >
              See This In Practice
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Different people, different workflows. Select your path to see how you might explore agentic tools.
            </motion.p>
          </div>

          {/* Persona Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
            {personas.map((persona, index) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedPersona(
                  selectedPersona === persona.id ? null : persona.id
                )}
                className={`card p-6 cursor-pointer transition-all duration-200 ${
                  selectedPersona === persona.id
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${persona.gradient}`}>
                  <persona.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-1">{persona.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{persona.role}</p>
                <p className="text-sm text-muted-foreground">{persona.scenario}</p>
              </motion.div>
            ))}
          </div>

          {/* Expanded Persona Detail */}
          <AnimatePresence>
            {selectedPersona && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto overflow-hidden"
              >
                {personas
                  .filter((p) => p.id === selectedPersona)
                  .map((persona) => (
                    <div key={persona.id} className="grid md:grid-cols-2 gap-8 bg-muted/50 rounded-lg p-8">
                      {/* Left: Step-by-step journey */}
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${persona.gradient}`}>
                            <persona.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{persona.name}&apos;s Journey</h4>
                            <p className="text-sm text-muted-foreground">{persona.role}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {persona.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                {i + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{step.title}</p>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Terminal demo */}
                      <div className="bg-muted rounded-lg border p-6 font-mono text-xs md:text-sm">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-3 h-3 rounded-full bg-destructive"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground ml-2">{persona.terminalTitle}</span>
                        </div>
                        <div className="space-y-2">
                          {persona.terminalLines.map((line, i) => (
                            <div key={i} className={line.type === 'output' ? 'text-muted-foreground' : 'text-foreground'}>
                              {line.type === 'command' && <span className="text-green-500">$ </span>}
                              {line.type === 'prompt' && <span className="text-blue-400">{persona.promptPrefix}&gt; </span>}
                              {line.type === 'success' && <span className="text-green-500">✓ </span>}
                              {line.type === 'pending' && <span className="text-yellow-500">⋯ </span>}
                              {line.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Levers Section */}
      <section id="levers" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold tracking-tight mb-4"
            >
              Master the 5 Levers of Control
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              Claude Code agents are shaped by 5 control mechanisms—each serving a distinct purpose in the agentic workflow.
              Click a lever to learn when and how to use it.
            </motion.p>
          </div>

          {/* 5 Lever Cards */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto mb-8">
            {LEVER_DEFINITIONS.map((lever, index) => (
              <motion.div
                key={lever.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedLever(
                  selectedLever === lever.id ? null : lever.id
                )}
                className={`card p-5 cursor-pointer transition-all duration-200 ${
                  selectedLever === lever.id
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${lever.gradient}`}>
                  <lever.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold mb-1">{lever.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{lever.analogy}</p>
                <p className="text-xs font-mono text-muted-foreground/80">{lever.file}</p>
              </motion.div>
            ))}
          </div>

          {/* Expanded Lever Detail */}
          <AnimatePresence>
            {selectedLever && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto overflow-hidden"
              >
                {LEVER_DEFINITIONS
                  .filter((lever) => lever.id === selectedLever)
                  .map((lever) => (
                    <div key={lever.id} className="grid md:grid-cols-2 gap-8 bg-background rounded-lg border p-8">
                      {/* Left: Details */}
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${lever.gradient}`}>
                            <lever.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{lever.name}</h4>
                            <p className="text-sm text-muted-foreground">{lever.analogy}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{lever.description}</p>
                        <h5 className="font-medium mb-3">When to use:</h5>
                        <ul className="space-y-2 mb-6">
                          {lever.whenToUse.map((use, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{use}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-2 text-sm">
                          <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">Security tie-in: {lever.securityTieIn}</span>
                        </div>
                        <a
                          href={lever.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-3 inline-block"
                        >
                          Read the docs →
                        </a>
                      </div>

                      {/* Right: Example Preview */}
                      <div className="bg-muted rounded-lg border p-4 font-mono text-xs overflow-auto">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-destructive"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground ml-2 font-sans">{lever.file}</span>
                        </div>
                        <pre className="text-muted-foreground whitespace-pre-wrap">{lever.example}</pre>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Ready to configure these levers for your agent?
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="btn-default px-6 py-2.5"
            >
              Configure Your Levers
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
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
              Ready to Build Your Workflow-Powered Agent?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose your domain, select a template with pre-built workflows, configure tools—then download a production-ready
              TypeScript CLI with slash commands, multi-step orchestration, and enterprise security.
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

      {/* Our Vision Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h3 className="text-2xl font-bold tracking-tight mb-6">Our Vision</h3>
            <p className="text-muted-foreground mb-8">
              Build An Agent Workshop is more than a tool—it&apos;s an educational resource for understanding
              what goes into production-grade AI agents. We believe in understanding before automation,
              open-source community-driven development, and the future of local-first, offline-capable AI tooling.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="px-4 py-2 rounded-full bg-background border">
                Open Source
              </div>
              <div className="px-4 py-2 rounded-full bg-background border">
                Educational First
              </div>
              <div className="px-4 py-2 rounded-full bg-background border">
                Local-First Future
              </div>
            </div>
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
            <p className="text-primary-foreground/80 mb-4">
              Free, open-source tool for generating AI agent CLIs
            </p>
            <p className="text-primary-foreground/80 mb-6">
              Built by{' '}
              <a
                href="https://github.com/GhostScientist"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary-foreground"
              >
                Dakota Kim
              </a>
            </p>
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} Build-An-Agent Workshop. Made with ❤️ for the AI community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Multi-Step Workflows',
    description: 'Domain-specific slash commands like /literature-review, /code-audit, /invoice-batch orchestrate complex multi-step processes. Template variables, retry logic, and error handling built-in.',
    icon: CodeBracketIcon,
  },
  {
    title: 'Production-Ready Security',
    description: 'Claude Code-style permission system with interactive prompts for file operations, command execution, and network requests. Users approve high-risk actions before they execute.',
    icon: CogIcon,
  },
  {
    title: 'SDK-Native & Customizable',
    description: 'Built on official Claude Agent SDK and OpenAI Agents API with MCP tool integration. Download complete TypeScript source—modify prompts, add tools, or extend workflows from day one.',
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

const securityHeuristics = [
  {
    id: 'sandbox',
    brief: 'Sandbox code execution in VMs or containers',
    expanded: 'Never run agent-generated code directly on your host machine. Use Docker containers, virtual machines, or cloud sandboxes to isolate execution and limit potential damage from malicious or buggy code.',
    link: {
      label: 'Docker security best practices',
      url: 'https://docs.docker.com/engine/security/',
    },
  },
  {
    id: 'minimize',
    brief: 'Minimize agent permissions by default',
    expanded: 'Start with read-only access and add write capabilities only when needed. The principle of least privilege applies doubly to autonomous agents—give them only what they need for the specific task.',
    link: {
      label: 'OWASP principle of least privilege',
      url: 'https://owasp.org/www-community/Access_Control',
    },
  },
  {
    id: 'boundaries',
    brief: 'Define explicit workflow boundaries',
    expanded: 'Specify exactly what the agent should and should not do. Clear boundaries prevent scope creep and reduce the risk of unintended actions. Use allowlists over denylists when possible.',
    link: {
      label: 'Anthropic responsible AI guidelines',
      url: 'https://www.anthropic.com/responsible-ai-policy',
    },
  },
  {
    id: 'validate',
    brief: 'Validate outputs before acting on them',
    expanded: 'Never blindly trust agent outputs for critical operations. Implement human-in-the-loop checkpoints, automated validation, and review steps before executing irreversible actions.',
    link: {
      label: 'Human-in-the-loop AI systems',
      url: 'https://hai.stanford.edu/news/humans-loop-design-interactive-ai-systems',
    },
  },
]

const personas = [
  {
    id: 'developer',
    name: 'Developer',
    role: 'Software Engineer',
    icon: CodeBracketIcon,
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    scenario: 'Automate code reviews, generate boilerplate, and run systematic audits with natural language commands.',
    promptPrefix: 'code-agent',
    terminalTitle: 'Code Review Agent',
    steps: [
      {
        title: 'Define your review criteria',
        description: 'Specify what matters: accessibility, performance, security, or your team\'s style guide.',
      },
      {
        title: 'Configure the agent',
        description: 'Select code analysis tools and set up your project structure.',
      },
      {
        title: 'Run targeted reviews',
        description: 'Use slash commands like /review or /audit on specific files or directories.',
      },
      {
        title: 'Iterate on suggestions',
        description: 'Review each suggestion, accept what makes sense, and refine the agent\'s understanding.',
      },
    ],
    terminalLines: [
      { type: 'command', content: 'code-review-agent' },
      { type: 'output', content: 'Code Review Agent v1.0.0' },
      { type: 'prompt', content: '/review src/components/Button.tsx --focus a11y,perf' },
      { type: 'output', content: 'Analyzing 127 lines...' },
      { type: 'success', content: 'Found 3 suggestions:' },
      { type: 'output', content: '  1. Missing aria-label on icon button' },
      { type: 'output', content: '  2. Consider useMemo for style calculation' },
      { type: 'output', content: '  3. Unused import: useEffect' },
    ],
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Academic / Analyst',
    icon: AcademicCapIcon,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    scenario: 'Systematic literature reviews, citation management, and evidence synthesis with source tracking.',
    promptPrefix: 'research',
    terminalTitle: 'Research Agent',
    steps: [
      {
        title: 'Gather your sources',
        description: 'Point the agent at a folder of papers, URLs, or a bibliography file.',
      },
      {
        title: 'Set citation format',
        description: 'Choose APA, MLA, Chicago, or a custom format for your field.',
      },
      {
        title: 'Run literature review',
        description: 'Use /literature-review to extract claims, identify gaps, and synthesize findings.',
      },
      {
        title: 'Export with citations',
        description: 'Get a structured report with proper citations and source links.',
      },
    ],
    terminalLines: [
      { type: 'command', content: 'research-agent' },
      { type: 'output', content: 'Research Operations Agent v1.0.0' },
      { type: 'prompt', content: '/literature-review --sources ./papers --format APA' },
      { type: 'success', content: 'Step 1/4: Found 18 documents' },
      { type: 'success', content: 'Step 2/4: Extracted 42 key claims' },
      { type: 'pending', content: 'Step 3/4: Identifying research gaps...' },
    ],
  },
  {
    id: 'business',
    name: 'Business Pro',
    role: 'Domain Specialist',
    icon: BriefcaseIcon,
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    scenario: 'Document processing, report generation, and workflow automation for repetitive business tasks.',
    promptPrefix: 'docs',
    terminalTitle: 'Document Processing Agent',
    steps: [
      {
        title: 'Identify the repetitive task',
        description: 'Invoice processing, report extraction, data entry—pick your pain point.',
      },
      {
        title: 'Define input/output format',
        description: 'Specify what documents look like and what data you need extracted.',
      },
      {
        title: 'Process in batches',
        description: 'Use /process to handle multiple documents with consistent formatting.',
      },
      {
        title: 'Validate and export',
        description: 'Review extracted data, fix edge cases, and export to your preferred format.',
      },
    ],
    terminalLines: [
      { type: 'command', content: 'doc-processor-agent' },
      { type: 'output', content: 'Document Processing Agent v1.0.0' },
      { type: 'prompt', content: '/process-invoices --batch ./pending --output csv' },
      { type: 'success', content: 'Processing 12 invoices...' },
      { type: 'success', content: 'Extracted: vendor, amount, date, line items' },
      { type: 'output', content: 'Saved to ./output/invoices-2024-01.csv' },
    ],
  },
  {
    id: 'hobbyist',
    name: 'Hobbyist',
    role: 'Tech Enthusiast',
    icon: SparklesIcon,
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
    scenario: 'Personal productivity tools, home automation scripts, and learning experiments with AI.',
    promptPrefix: 'helper',
    terminalTitle: 'Personal Assistant Agent',
    steps: [
      {
        title: 'Pick a personal pain point',
        description: 'RSS digests, bookmark organization, note summarization—start with something you do often.',
      },
      {
        title: 'Start with a simple agent',
        description: 'Choose minimal tools and a focused purpose. You can always add more later.',
      },
      {
        title: 'Experiment and iterate',
        description: 'Run your agent, see what works, tweak the prompts and workflows.',
      },
      {
        title: 'Learn by building',
        description: 'Each iteration teaches you more about what agents can (and can\'t) do well.',
      },
    ],
    terminalLines: [
      { type: 'command', content: 'daily-helper-agent' },
      { type: 'output', content: 'Personal Helper Agent v1.0.0' },
      { type: 'prompt', content: '/daily-digest --rss ./feeds.opml --summarize' },
      { type: 'success', content: 'Fetched 47 new articles from 12 feeds' },
      { type: 'success', content: 'Generated 5 topic summaries' },
      { type: 'output', content: 'Top story: "New developments in local-first software"' },
    ],
  },
]
