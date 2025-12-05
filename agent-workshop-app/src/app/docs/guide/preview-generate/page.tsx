'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';

export default function PreviewGeneratePage() {
  return (
    <DocsLayout
      title="Preview & Generate"
      description="Step 7: Review your configuration and download your agent project."
    >
      <p>
        The final step lets you review your complete configuration, preview the
        generated code, and download your agent as a ZIP file.
      </p>

      <h2>Configuration Review</h2>
      <p>
        Before generating, verify your configuration:
      </p>

      <h3>Basic Settings</h3>
      <ul>
        <li><strong>Domain</strong> - Your agent&apos;s area of expertise</li>
        <li><strong>Template</strong> - The template you selected (if any)</li>
        <li><strong>SDK Provider</strong> - Claude or OpenAI</li>
        <li><strong>Model</strong> - The specific model to use</li>
      </ul>

      <h3>Tools &amp; MCP</h3>
      <ul>
        <li><strong>Enabled tools</strong> - List of tools your agent can use</li>
        <li><strong>Permission level</strong> - Restrictive, Balanced, or Permissive</li>
        <li><strong>MCP servers</strong> - External servers configured</li>
      </ul>

      <h3>Project Metadata</h3>
      <ul>
        <li><strong>Agent name</strong> - Display name</li>
        <li><strong>Project name</strong> - Directory name</li>
        <li><strong>Package name</strong> - npm package name</li>
        <li><strong>Version</strong> - Semantic version</li>
        <li><strong>License</strong> - License type</li>
      </ul>

      <h2>Code Preview</h2>
      <p>
        The preview panel shows the generated code for key files:
      </p>
      <ul>
        <li><code>package.json</code> - Dependencies and scripts</li>
        <li><code>src/agent.ts</code> - Main agent logic</li>
        <li><code>src/cli.ts</code> - CLI entry point</li>
        <li><code>.mcp.json</code> - MCP server configuration</li>
      </ul>

      <p>
        Use the file tabs to switch between previews and verify the generated code
        matches your expectations.
      </p>

      <h2>Downloading Your Project</h2>
      <p>
        Click <strong>Download Project</strong> to generate a ZIP file containing
        your complete agent project.
      </p>

      <h3>ZIP Contents</h3>
      <CodeBlock
        language="bash"
        code={`my-agent.zip
├── package.json
├── tsconfig.json
├── src/
│   ├── cli.ts
│   ├── agent.ts
│   ├── config.ts
│   ├── permissions.ts
│   ├── mcp-config.ts
│   ├── planner.ts
│   └── workflows.ts
├── .commands/
│   └── *.json           # Domain-specific workflow commands
├── .plans/
│   └── .gitkeep
├── .mcp.json
├── .env.example
├── .gitignore
├── README.md
├── LICENSE
└── scripts/
    └── publish.sh`}
      />

      <h2>Next Steps After Download</h2>

      <h3>1. Extract the ZIP</h3>
      <CodeBlock
        language="bash"
        code={`unzip my-agent.zip
cd my-agent`}
      />

      <h3>2. Install Dependencies</h3>
      <CodeBlock
        language="bash"
        code={`npm install`}
      />

      <h3>3. Configure Environment</h3>
      <CodeBlock
        language="bash"
        code={`cp .env.example .env
# Edit .env and add your API key:
# ANTHROPIC_API_KEY=your-key-here
# or
# OPENAI_API_KEY=your-key-here`}
      />

      <h3>4. Build the Agent</h3>
      <CodeBlock
        language="bash"
        code={`npm run build`}
      />

      <h3>5. Run the Agent</h3>
      <CodeBlock
        language="bash"
        code={`npm start`}
      />

      <Callout type="success" title="You're ready!">
        <p>
          Your agent is now running. Type a message to start chatting, or use
          <code>/help</code> to see available commands.
        </p>
      </Callout>

      <h2>Troubleshooting</h2>

      <h3>Build Errors</h3>
      <p>
        If you encounter TypeScript errors during build:
      </p>
      <ul>
        <li>Ensure you&apos;re using Node.js 18 or later</li>
        <li>Delete <code>node_modules</code> and run <code>npm install</code> again</li>
        <li>Check that all dependencies installed correctly</li>
      </ul>

      <h3>API Key Issues</h3>
      <p>
        If the agent can&apos;t connect to the AI provider:
      </p>
      <ul>
        <li>Verify your API key is correct in <code>.env</code></li>
        <li>Check that the key has the required permissions</li>
        <li>Ensure you&apos;re using the correct key for your selected provider</li>
      </ul>

      <h3>MCP Server Errors</h3>
      <p>
        If MCP servers fail to start:
      </p>
      <ul>
        <li>Verify the required packages are installed globally or will be fetched via npx</li>
        <li>Check that environment variables referenced in <code>.mcp.json</code> are set</li>
        <li>Review server-specific documentation for setup requirements</li>
      </ul>

      <h2>Further Reading</h2>
      <ul>
        <li>
          <Link href="/docs/generated/project-structure" className="text-blue-600 hover:underline">
            Project Structure
          </Link>{' '}
          - Detailed explanation of generated files
        </li>
        <li>
          <Link href="/docs/generated/customization" className="text-blue-600 hover:underline">
            Customization
          </Link>{' '}
          - How to modify your agent
        </li>
        <li>
          <Link href="/docs/best-practices/security" className="text-blue-600 hover:underline">
            Security Guidelines
          </Link>{' '}
          - Best practices for safe operation
        </li>
      </ul>
    </DocsLayout>
  );
}
