'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Wrench, Layers } from 'lucide-react';

export default function DocsPage() {
  return (
    <DocsLayout
      title="Introduction"
      description="Build production-ready AI agent CLIs in minutes with the Agent Workshop."
    >
      <h2>What is Agent Workshop?</h2>
      <p>
        Agent Workshop is a no-code web application that transforms your ideas into fully-functional
        AI agent command-line interfaces. It generates complete TypeScript projects that you can
        customize, extend, and deploy.
      </p>

      <p>
        The generated agents support two major AI providers:
      </p>
      <ul>
        <li><strong>Claude Agent SDK</strong> - Anthropic&apos;s official agent framework</li>
        <li><strong>OpenAI Agents SDK</strong> - OpenAI&apos;s official agent framework</li>
      </ul>

      <h2>Key Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Rapid Development</h3>
          </div>
          <p className="text-sm text-gray-600">
            Go from idea to working agent in minutes with our 7-step wizard.
          </p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Security-First</h3>
          </div>
          <p className="text-sm text-gray-600">
            Built-in permission system with restrictive, balanced, and permissive modes.
          </p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">15 Built-in Tools</h3>
          </div>
          <p className="text-sm text-gray-600">
            File operations, web search, database queries, and more out of the box.
          </p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">MCP Integration</h3>
          </div>
          <p className="text-sm text-gray-600">
            Connect to external services via Model Context Protocol servers.
          </p>
        </div>
      </div>

      <h2>How It Works</h2>

      <p>The Agent Workshop guides you through a 7-step configuration wizard:</p>

      <ol>
        <li><strong>Domain Selection</strong> - Choose your agent&apos;s area of expertise (Development, Business, Creative, Data, or Knowledge)</li>
        <li><strong>Template Selection</strong> - Pick a pre-built template or start from scratch</li>
        <li><strong>SDK Configuration</strong> - Select your AI provider (Claude or OpenAI) and model</li>
        <li><strong>Tool Configuration</strong> - Enable the capabilities your agent needs</li>
        <li><strong>MCP Configuration</strong> - Connect external servers via Model Context Protocol</li>
        <li><strong>Project Settings</strong> - Configure metadata like name, version, and license</li>
        <li><strong>Preview &amp; Generate</strong> - Review and download your complete project</li>
      </ol>

      <h2>What You Get</h2>

      <p>After completing the wizard, you download a ZIP file containing:</p>

      <CodeBlock
        language="bash"
        code={`my-agent/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── cli.ts           # CLI entry point
│   ├── agent.ts         # Agent logic and tool setup
│   ├── config.ts        # Configuration management
│   ├── permissions.ts   # Permission system
│   └── mcp-config.ts    # MCP server setup
├── .commands/            # Workflow commands (domain-specific)
├── .mcp.json            # MCP server configuration
├── README.md            # Setup and usage docs
├── .env.example         # Environment template
└── .gitignore           # Git ignore rules`}
      />

      <Callout type="tip" title="Ready to build?">
        <p>
          Head to the{' '}
          <Link href="/docs/quick-start" className="text-blue-600 hover:underline">
            Quick Start guide
          </Link>{' '}
          to create your first agent in under 5 minutes.
        </p>
      </Callout>

      <h2>Who Is This For?</h2>

      <ul>
        <li>
          <strong>Developers</strong> who want to quickly prototype AI-powered tools
        </li>
        <li>
          <strong>Researchers</strong> who need automated literature review and data analysis
        </li>
        <li>
          <strong>Business professionals</strong> automating document processing and reporting
        </li>
        <li>
          <strong>Hobbyists</strong> exploring what&apos;s possible with AI agents
        </li>
      </ul>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 not-prose">
        <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
        <div className="space-y-2">
          <Link
            href="/docs/quick-start"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowRight className="w-4 h-4" />
            Quick Start Guide
          </Link>
          <Link
            href="/docs/concepts"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowRight className="w-4 h-4" />
            Core Concepts
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowRight className="w-4 h-4" />
            Start Building
          </Link>
        </div>
      </div>
    </DocsLayout>
  );
}
