'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function RunningAgentPage() {
  return (
    <DocsLayout
      title="Running Your Agent"
      description="How to set up and run your generated agent."
    >
      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18 or later</li>
        <li>npm or yarn</li>
        <li>API key from your chosen provider (Anthropic or OpenAI)</li>
      </ul>

      <h2>Initial Setup</h2>

      <h3>1. Extract the Project</h3>
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
      <p>
        Copy the example environment file and add your API key:
      </p>
      <CodeBlock
        language="bash"
        code={`cp .env.example .env`}
      />
      <p>
        Edit <code>.env</code> and add your API key:
      </p>
      <CodeBlock
        language="bash"
        code={`# For Claude Agent SDK
ANTHROPIC_API_KEY=sk-ant-...

# For OpenAI SDK
OPENAI_API_KEY=sk-...`}
      />

      <h3>4. Build the Project</h3>
      <CodeBlock
        language="bash"
        code={`npm run build`}
      />

      <h3>5. Run the Agent</h3>
      <CodeBlock
        language="bash"
        code={`npm start`}
      />

      <h2>Interactive Mode</h2>
      <p>
        By default, the agent runs in interactive mode with a prompt:
      </p>
      <CodeBlock
        language="bash"
        code={`✨ My Agent v1.0.0
Type your message, use /help for commands, or 'exit' to quit.

You: `}
      />

      <h3>Basic Usage</h3>
      <p>
        Type your message and press Enter. The agent will process your request
        and stream the response:
      </p>
      <CodeBlock
        language="bash"
        code={`You: What files are in the current directory?

Agent: I'll check the current directory for you.

[Using find-files tool...]

The current directory contains:
- package.json
- tsconfig.json
- src/
  - cli.ts
  - agent.ts
  ...`}
      />

      <h3>Special Commands</h3>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>/help</code></td>
            <td>Show available commands</td>
          </tr>
          <tr>
            <td><code>/clear</code></td>
            <td>Clear conversation history</td>
          </tr>
          <tr>
            <td><code>/config</code></td>
            <td>Show current configuration</td>
          </tr>
          <tr>
            <td><code>/plan</code></td>
            <td>Enter planning mode</td>
          </tr>
          <tr>
            <td><code>/plans</code></td>
            <td>List saved plans</td>
          </tr>
          <tr>
            <td><code>exit</code></td>
            <td>Exit the agent</td>
          </tr>
        </tbody>
      </table>

      <h3>Slash Commands</h3>
      <p>
        If you configured slash commands, use them with <code>/command-name</code>:
      </p>
      <CodeBlock
        language="bash"
        code={`You: /review-pr 123

📋 Running /review-pr...

Agent: I'll review pull request #123 for you...`}
      />

      <h2>Single Query Mode</h2>
      <p>
        Run a single query without entering interactive mode:
      </p>
      <CodeBlock
        language="bash"
        code={`npm start -- --query "What files are in src/"`}
      />
      <p>
        Or with the built binary:
      </p>
      <CodeBlock
        language="bash"
        code={`./dist/cli.js --query "Analyze package.json"`}
      />

      <h2>Development Mode</h2>
      <p>
        For development, use watch mode to auto-rebuild on changes:
      </p>
      <CodeBlock
        language="bash"
        code={`# Terminal 1: Watch for changes
npm run dev

# Terminal 2: Run the agent
npm start`}
      />

      <h2>Global Installation</h2>
      <p>
        Install your agent globally to use it from anywhere:
      </p>
      <CodeBlock
        language="bash"
        code={`npm run build
npm link

# Now use it globally
my-agent`}
      />

      <h2>Troubleshooting</h2>

      <h3>API Key Errors</h3>
      <Callout type="warning" title="Invalid API Key">
        <p>
          If you see &quot;Invalid API key&quot; errors, verify:
        </p>
        <ul className="mt-2 list-disc list-inside">
          <li>The key is correctly set in <code>.env</code></li>
          <li>There are no extra spaces or quotes around the key</li>
          <li>The key matches your selected SDK provider</li>
        </ul>
      </Callout>

      <h3>Build Errors</h3>
      <p>
        If TypeScript compilation fails:
      </p>
      <ul>
        <li>Ensure Node.js 18+ is installed</li>
        <li>Delete <code>node_modules</code> and run <code>npm install</code> again</li>
        <li>Check for syntax errors in any customizations</li>
      </ul>

      <h3>Permission Errors</h3>
      <p>
        If tools are being blocked:
      </p>
      <ul>
        <li>Check your permission level in the configuration</li>
        <li>Verify the tool is enabled</li>
        <li>Some operations may require user confirmation</li>
      </ul>

      <h3>MCP Server Errors</h3>
      <p>
        If MCP servers fail to connect:
      </p>
      <ul>
        <li>Verify required environment variables are set</li>
        <li>Check that npx can download the server package</li>
        <li>Review <code>.mcp.json</code> for configuration errors</li>
      </ul>
    </DocsLayout>
  );
}
