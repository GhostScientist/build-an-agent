'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';

export default function QuickStartPage() {
  return (
    <DocsLayout
      title="Quick Start"
      description="Create your first AI agent in under 5 minutes."
    >
      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18 or later</li>
        <li>An API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">Anthropic</a> or <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">OpenAI</a></li>
      </ul>

      <h2>Step 1: Open the Builder</h2>
      <p>
        Navigate to the <Link href="/" className="text-blue-600 hover:underline">Agent Builder</Link> to start the configuration wizard.
      </p>

      <h2>Step 2: Choose a Domain</h2>
      <p>
        Select the domain that best matches your use case:
      </p>
      <ul>
        <li><strong>Development</strong> - Code review, testing, modernization</li>
        <li><strong>Business</strong> - Document processing, reports, automation</li>
        <li><strong>Creative</strong> - Content creation, copywriting</li>
        <li><strong>Data</strong> - Analysis, visualization, ML pipelines</li>
        <li><strong>Knowledge</strong> - Research, literature review, citations</li>
      </ul>

      <h2>Step 3: Pick a Template</h2>
      <p>
        Choose a pre-built template for your domain. Templates come with sensible defaults for tools and configuration.
      </p>

      <Callout type="tip" title="Start with a template">
        <p>
          Templates are the fastest way to get started. You can always customize later.
        </p>
      </Callout>

      <h2>Step 4: Configure SDK</h2>
      <p>
        Select your AI provider:
      </p>
      <ul>
        <li><strong>Claude Agent SDK</strong> (recommended) - Claude Sonnet 4.5, Haiku 4.5, or Opus 4.1</li>
        <li><strong>OpenAI SDK</strong> - GPT-5.1, GPT-5 mini, GPT-4.1, and more</li>
      </ul>

      <h2>Step 5: Enable Tools</h2>
      <p>
        Tools give your agent capabilities. For a quick start, the template defaults are usually sufficient.
        You can enable additional tools based on your needs.
      </p>

      <Callout type="info" title="Skip MCP for now">
        <p>
          The MCP Configuration step is optional. You can skip it for your first agent
          and add MCP servers later if needed.
        </p>
      </Callout>

      <h2>Step 6: Set Project Details</h2>
      <p>
        Give your agent a name and configure basic project metadata like version and author.
      </p>

      <h2>Step 7: Generate &amp; Download</h2>
      <p>
        Review your configuration and click <strong>Download Project</strong> to get a ZIP file with your complete agent.
      </p>

      <h2>Running Your Agent</h2>

      <p>Extract the ZIP and run these commands:</p>

      <CodeBlock
        language="bash"
        code={`# Navigate to your agent directory
cd my-agent

# Install dependencies
npm install

# Set up your API key
cp .env.example .env
# Edit .env and add your API key

# Build the agent
npm run build

# Run the agent
npm start`}
      />

      <p>You&apos;ll see an interactive prompt where you can chat with your agent:</p>

      <CodeBlock
        language="bash"
        code={`✨ My Agent v1.0.0
Type your message, use /help for commands, or 'exit' to quit.

You: Hello! What can you do?

Agent: I'm your AI assistant. Based on my configuration, I can help you with:
- Reading and analyzing files
- Searching through your codebase
- Answering questions about your project
...`}
      />

      <Callout type="info" title="Need help?">
        <p>
          Use the <code>/help</code> command inside your agent to see available commands,
          or check the generated README.md for detailed documentation.
        </p>
      </Callout>

      <h2>Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/concepts" className="text-blue-600 hover:underline">
            Learn Core Concepts
          </Link>{' '}
          - Understand domains, tools, and templates
        </li>
        <li>
          <Link href="/docs/features/tools" className="text-blue-600 hover:underline">
            Explore Built-in Tools
          </Link>{' '}
          - File operations, web search, database queries, and more
        </li>
        <li>
          <Link href="/docs/generated/customization" className="text-blue-600 hover:underline">
            Customize Your Agent
          </Link>{' '}
          - Modify the generated code
        </li>
        <li>
          <Link href="/docs/features/levers" className="text-blue-600 hover:underline">
            Learn About Claude Code Levers
          </Link>{' '}
          - Memory, Commands, Skills, Subagents, and Hooks for your target project
        </li>
      </ul>
    </DocsLayout>
  );
}
