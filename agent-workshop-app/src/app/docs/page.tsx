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
      description="Generate inspectable agent starters and learn how their runtimes, tools, and policies work."
    >
      <h2>What is Agent Workshop?</h2>
      <p>
        Agent Workshop offers a visual web builder and the <code>build-agent-app</code> CLI wizard.
        Both generate starter files you run yourself, not hosted agents or production-certified systems.
        Claude, OpenAI, and Copilot produce TypeScript projects; HuggingFace produces a lightweight
        configuration for the tiny-agents runtime.
      </p>

      <p>
        The generated agents support several major AI providers:
      </p>
      <ul>
        <li><strong>Claude Agent SDK</strong> - Anthropic&apos;s official agent framework</li>
        <li><strong>OpenAI Agents SDK</strong> - OpenAI&apos;s official agent framework</li>
        <li><strong>GitHub Copilot SDK</strong> - the Copilot CLI runtime, requiring Copilot access</li>
        <li><strong>HuggingFace tiny-agents</strong> - configuration-driven agents with external inference and MCP tools</li>
      </ul>

      <h2>Key Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Rapid Development</h3>
          </div>
          <p className="text-sm text-gray-600">
            Use an eight-step TypeScript builder or a three-step Tiny Agents flow.
          </p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Security-First</h3>
          </div>
          <p className="text-sm text-gray-600">
            TypeScript starters include provider-specific permission handling, not an OS sandbox.
          </p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Configurable Tools</h3>
          </div>
          <p className="text-sm text-gray-600">
            Tool implementations and runtime built-ins vary by provider. Some integrations need extra setup.
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

      <p>The web builder&apos;s full TypeScript flow has eight steps:</p>

      <ol>
        <li><strong>Provider Selection</strong> - Choose Claude, OpenAI, or Copilot for a TypeScript project</li>
        <li><strong>Domain Selection</strong> - Choose your agent&apos;s area of expertise (Development, Business, Creative, Data, or Knowledge)</li>
        <li><strong>Template Selection</strong> - Pick a pre-built template or start from scratch</li>
        <li><strong>Model Configuration</strong> - Select an example model and check access with your provider</li>
        <li><strong>Tool Configuration</strong> - Enable the capabilities your agent needs</li>
        <li><strong>MCP Configuration</strong> - Connect external servers via Model Context Protocol</li>
        <li><strong>Project Settings</strong> - Configure metadata like name, version, and license</li>
        <li><strong>Preview &amp; Generate</strong> - Review and download your complete project</li>
      </ol>
      <p>
        Tiny Agents instead uses Provider → Configure Agent → Preview &amp; Download.
        The CLI asks for a project name first; its TypeScript flow leaves MCP configuration
        for after generation, while the web builder offers an MCP selection step.
      </p>

      <h2>What You Get</h2>

      <p>
        The web builder downloads a ZIP; the CLI writes a local directory. A TypeScript
        starter contains files like the following. Tiny Agents instead generates
        <code> agent.json</code>, <code>PROMPT.md</code>, and supporting setup files.
      </p>

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
            Learning Path &amp; Core Concepts
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
